// src/features/inventario/services/inventario.service.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function assertUmbralMin(n: number) {
  if (!Number.isFinite(n) || n < 0) throw new Error('umbralMin debe ser un entero >= 0');
}

export const InventarioService = {
  /** Para llenar el modal: inventario del depósito (incluye nombre del producto). */
  async listByDeposito(idDeposito: number) {
    return prisma.inventario.findMany({
      where: { idDeposito },
      include: { producto: { select: { idProducto: true, nombreComercial: true } } },
      orderBy: [{ producto: { nombreComercial: 'asc' } }],
    });
  },

  /** Bulk “Guardar todos”: upsert de varios umbrales del mismo depósito. */
  async bulkUpsertUmbralMin(
    idDeposito: number,
    items: Array<{ idProducto: number; umbralMin: number }>
  ) {
    if (!Number.isInteger(idDeposito) || idDeposito <= 0) throw new Error('idDeposito inválido');
    items.forEach(i => assertUmbralMin(i.umbralMin));

    const dep = await prisma.deposito.findUnique({ where: { id: idDeposito } });
    if (!dep) throw new Error('Depósito inexistente');

    const productosIds = items.map(i => i.idProducto);
    const productosOK = await prisma.producto.findMany({
      where: { idProducto: { in: productosIds } },
      select: { idProducto: true },
    });
    const existentes = new Set(productosOK.map(p => p.idProducto));
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

    return this.listByDeposito(idDeposito);
  },
};
