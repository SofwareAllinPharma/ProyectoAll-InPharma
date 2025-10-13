import { PrismaClient } from '@prisma/client';
import { calcularEstado, EstadoStock } from './inventario.estado';
const prisma = new PrismaClient();

export const InventarioService = {
  /** Listado del depósito con estado + soporte de filtros básicos */
  async listByDeposito(
    idDeposito: number,
    opts?: { q?: string; estado?: EstadoStock; sort?: 'producto'|'cantidad'|'actualizacion'; order?: 'asc'|'desc'; page?: number; pageSize?: number }
  ) {
    const { q, estado, sort = 'producto', order = 'asc', page = 1, pageSize = 20 } = opts || {};

    // Traigo inventario + producto; (más adelante se podrá LEFT JOIN movimientos para 'ultimaActualizacion')
    const rows = await prisma.inventario.findMany({
      where: {
        idDeposito,
        ...(q ? { producto: { nombreComercial: { contains: q, mode: 'insensitive' } } } : {}),
      },
      include: { producto: { select: { idProducto: true, nombreComercial: true } } },
      orderBy:
        sort === 'cantidad' ? { cantidadProducto: order }
        : sort === 'actualizacion' ? { /* placeholder */ idProducto: order } // se reemplazará por lastMovementAt
        : { producto: { nombreComercial: order } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const withEstado = rows.map(r => {
      const estado = calcularEstado(r.cantidadProducto, r.umbralMin ?? null);
      return {
        ...r,
        estado,
        ultimaActualizacion: null as Date | null, // TODO: poblar cuando esté Movimientos
      };
    });

    // Filtro por estado si vino en query
    return estado ? withEstado.filter(r => r.estado === estado) : withEstado;
  },

  /** Resumen (totales por estado) para las cards/filtros del depósito */
  async resumenEstados(idDeposito: number) {
    const rows = await prisma.inventario.findMany({
      where: { idDeposito },
      select: { cantidadProducto: true, umbralMin: true },
    });

    const counters = { critico: 0, bajo: 0, normal: 0, default: 0 };
    for (const r of rows) {
      counters[calcularEstado(r.cantidadProducto, r.umbralMin ?? null)]++;
    }
    return counters;
  },

  /** Bulk “Guardar todos” (queda igual a tu última versión) */
  async bulkUpsertUmbralMin(
    idDeposito: number,
    items: Array<{ idProducto: number; umbralMin: number }>
  ) {
    if (!Number.isInteger(idDeposito) || idDeposito <= 0) throw new Error('idDeposito inválido');
    items.forEach(i => {
      if (!Number.isFinite(i.umbralMin) || i.umbralMin < 0) throw new Error('umbralMin debe ser un entero >= 0');
    });

    const dep = await prisma.deposito.findUnique({ where: { id: idDeposito } });
    if (!dep) throw new Error('Depósito inexistente');

    const productosIds = items.map(i => i.idProducto);
    const existentes = new Set(
      (await prisma.producto.findMany({ where: { idProducto: { in: productosIds } }, select: { idProducto: true } }))
      .map(p => p.idProducto)
    );
    const faltantes = productosIds.filter(id => !existentes.has(id));
    if (faltantes.length) throw new Error(`Productos inexistentes: ${faltantes.join(', ')}`);

    await prisma.$transaction(
      items.map(i =>
        prisma.inventario.upsert({
          where: { idDeposito_idProducto: { idDeposito, idProducto: i.idProducto } },
          update: { umbralMin: i.umbralMin },
          create: { idDeposito, idProducto: i.idProducto, cantidadProducto: 0, umbralMin: i.umbralMin },
        })
      )
    );

    // devolvemos con estado
    const data = await prisma.inventario.findMany({
      where: { idDeposito },
      include: { producto: { select: { idProducto: true, nombreComercial: true } } },
      orderBy: [{ producto: { nombreComercial: 'asc' } }],
    });
    return data.map(r => ({ ...r, estado: calcularEstado(r.cantidadProducto, r.umbralMin ?? null), ultimaActualizacion: null }));
  },
};
