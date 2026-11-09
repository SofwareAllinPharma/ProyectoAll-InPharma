import { prisma } from '../lib/prisma';
import { LotesService } from './lotes.service';

export const InventarioGlobalService = {
  async resumenEstadosGlobal() {
    const depositos = await prisma.deposito.findMany({ where: { estado: true }, select: { id: true } });
    const filas = (await Promise.all(depositos.map(d => new LotesService().alertasPorDeposito(d.id)))).flat();
    const counters = { critico: 0, bajo: 0, normal: 0, default: 0 };
    for (const f of filas.filter(f => f.cantidadProducto > 0 || f.umbralMin !== null)) {
      counters[f.estado.toLowerCase() as keyof typeof counters]++;
    }
    return { totalProductos: new Set(filas.filter(f => f.cantidadProducto > 0).map(f => f.idProducto)).size, ...counters };
  },

  async listGlobal(opts?: { q?: string; sort?: 'producto' | 'cantidad'; order?: 'asc' | 'desc' }) {
    const productos = await prisma.producto.findMany({
      where: { estaActivo: true, ...(opts?.q ? { nombreComercial: { contains: opts.q, mode: 'insensitive' as const } } : {}) },
      select: { idProducto: true, nombreComercial: true, lotes: { select: { cajas: { where: { deposito: { estado: true }, unidades: { gt: 0 } }, include: { deposito: { select: { id: true, nombre: true } } } } } } },
    });
    const rows = productos.map(p => {
      const cajas = p.lotes.flatMap(l => l.cajas);
      const stockTotal = cajas.reduce((s, c) => s + c.unidades, 0);
      const deps = [...new Set(cajas.map(c => c.idDeposito))];
      return { idProducto: p.idProducto, producto: p.nombreComercial, stockTotal,
        distribucion: deps.map(id => {
          const propias = cajas.filter(c => c.idDeposito === id);
          const cantidad = propias.reduce((s, c) => s + c.unidades, 0);
          return { idDeposito: id, nombre: propias[0].deposito.nombre, cantidad, porcentaje: stockTotal ? Math.round(cantidad / stockTotal * 100) : 0 };
        }),
        updatedAt: cajas.length ? new Date(Math.max(...cajas.map(c => c.updatedAt.getTime()))).toISOString() : undefined };
    });
    const sentido = opts?.order === 'desc' ? -1 : 1;
    rows.sort((a, b) => sentido * (opts?.sort === 'cantidad' ? a.stockTotal - b.stockTotal : a.producto.localeCompare(b.producto)));
    return rows;
  },
};
