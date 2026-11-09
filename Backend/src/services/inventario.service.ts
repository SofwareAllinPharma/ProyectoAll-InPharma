import { prisma } from '../lib/prisma';
import { LotesService } from './lotes.service';
import { calcularEstado, EstadoStock } from './inventario.estado';

export const InventarioService = {

  /** Para configuración de umbrales: todos los productos activos, con o sin stock */
  async listProductosConUmbral(idDeposito: number) {
    return new LotesService().alertasPorDeposito(idDeposito);
  },
  /** Para la tabla de inventario: solo productos con stock en el depósito (independiente de umbral) */
  async listInventarioByDeposito(idDeposito: number) {
    return (await new LotesService().alertasPorDeposito(idDeposito))
      .filter(r => r.cantidadProducto > 0 || r.umbralMin !== null)
      .map(r => ({ ...r, estado: r.estado.toLowerCase() as EstadoStock }));
  },

  async resumenEstados(idDeposito: number) {
    const rows = await this.listInventarioByDeposito(idDeposito);
    const counters = { critico: 0, bajo: 0, normal: 0, default: 0 };
    for (const r of rows) counters[r.estado]++;
    return { total: rows.length, ...counters };
  },

  /** Bulk “Guardar todos” (queda igual a tu última versión) */
  async bulkUpsertUmbralMin(
    idDeposito: number,
    items: Array<{ idProducto: number; umbralMin: number }>
  ) {
    if (!Number.isInteger(idDeposito) || idDeposito <= 0) throw new Error('idDeposito inválido');
    items.forEach(i => {
      if (!Number.isSafeInteger(i.umbralMin) || i.umbralMin < 0) throw new Error('umbralMin debe ser un entero >= 0');
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

    return this.listProductosConUmbral(idDeposito);
  },
};
