import { PrismaClient } from '@prisma/client';
import { calcularEstado } from './inventario.estado';
const prisma = new PrismaClient();

type Distribucion = { idDeposito: number; nombre: string; cantidad: number; porcentaje: number };

export const InventarioGlobalService = {
  /** Cards globales: suma de estados de TODAS las filas (depósito×producto) con stock y producto activo */
  async resumenEstadosGlobal() {
    const filas = await prisma.inventario.findMany({
      where: { cantidadProducto: { gt: 0 }, producto: { estaActivo: true } },
      select: { cantidadProducto: true, umbralMin: true },
    });

    const counters = { critico: 0, bajo: 0, normal: 0, default: 0 };
    for (const f of filas) {
      const estado = calcularEstado(f.cantidadProducto, f.umbralMin ?? null);
      (counters as any)[estado]++;
    }

    // totalProductos: cantidad de productos únicos con stock (>0) en al menos un depósito
    const productosUnicos = await prisma.inventario.groupBy({
      by: ['idProducto'],
      where: { cantidadProducto: { gt: 0 }, producto: { estaActivo: true } },
      _sum: { cantidadProducto: true },
    });

    return {
      totalProductos: productosUnicos.length,
      normal: counters.normal,
      bajo: counters.bajo,
      critico: counters.critico,
      default: counters.default,
    };
  },

  /** Listado global: producto + stock total + distribución por depósito (sin nivel ni actualización) */
  async listGlobal(opts?: { q?: string; sort?: 'producto' | 'cantidad'; order?: 'asc' | 'desc' }) {
    const { q, sort = 'producto', order = 'asc' } = opts || {};

    // Traigo productos activos con sus filas de inventario y depósitos
    const productos = await prisma.producto.findMany({
      where: { estaActivo: true, ...(q ? { nombreComercial: { contains: q, mode: 'insensitive' } } : {}) },
      select: {
        idProducto: true,
        nombreComercial: true,
        inventario: { include: { deposito: { select: { id: true, nombre: true } } } },
      },
    });

    let rows = productos.map(p => {
      const total = p.inventario.reduce((acc, r) => acc + r.cantidadProducto, 0);
      const distribucion: Distribucion[] = p.inventario.map(r => ({
        idDeposito: r.idDeposito,
        nombre: r.deposito.nombre,
        cantidad: r.cantidadProducto,
        porcentaje: total > 0 ? Math.round((r.cantidadProducto / total) * 100) : 0,
      }));
      return {
        idProducto: p.idProducto,
        producto: p.nombreComercial,
        stockTotal: total,
        distribucion,
      };
    });

    if (sort === 'producto') {
      rows.sort((a, b) =>
        order === 'asc'
          ? a.producto.localeCompare(b.producto)
          : b.producto.localeCompare(a.producto)
      );
    } else if (sort === 'cantidad') {
      rows.sort((a, b) => (order === 'asc' ? a.stockTotal - b.stockTotal : b.stockTotal - a.stockTotal));
    }

    return rows;
  },
};
