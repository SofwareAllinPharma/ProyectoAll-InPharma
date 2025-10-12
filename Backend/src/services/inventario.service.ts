import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export type UpsertUmbralMinDTO = {
  idDeposito: number;
  idProducto: number;
  umbralMin: number;
};

function assertUmbralMin(n: number) {
  if (!Number.isFinite(n) || n < 0) throw new Error('umbralMin debe ser un entero >= 0');
}

export const InventarioService = {
  async getOne(idDeposito: number, idProducto: number) {
    return prisma.inventario.findUnique({
      where: { idDeposito_idProducto: { idDeposito, idProducto } },
      include: {
        producto: { select: { idProducto: true, nombreComercial: true } },
        deposito: { select: { id: true, nombre: true } },
      },
    });
  },

  /** Crea/actualiza SOLO umbralMin. Deja umbralMax intacto (puede quedar null). */
  async upsertUmbralMin({ idDeposito, idProducto, umbralMin }: UpsertUmbralMinDTO) {
    assertUmbralMin(umbralMin);

    const [dep, prod] = await Promise.all([
      prisma.deposito.findUnique({ where: { id: idDeposito } }),
      prisma.producto.findUnique({ where: { idProducto } }),
    ]);
    if (!dep) throw new Error('Depósito inexistente');
    if (!prod) throw new Error('Producto inexistente');

    const inv = await prisma.inventario.upsert({
      where: { idDeposito_idProducto: { idDeposito, idProducto } },
      update: { umbralMin },
      create: { idDeposito, idProducto, cantidadProducto: 0, umbralMin },
      include: {
        producto: { select: { idProducto: true, nombreComercial: true } },
        deposito: { select: { id: true, nombre: true } },
      },
    });

    return {
      ...inv,
      estado: { bajoMinimo: inv.cantidadProducto < inv.umbralMin }, // sin “máximo”
    };
  },

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
    // validaciones básicas
    if (!Number.isInteger(idDeposito) || idDeposito <= 0) throw new Error('idDeposito inválido');
    items.forEach(i => assertUmbralMin(i.umbralMin));

    // confirmo depósito y productos válidos (mensaje claro si falta alguno)
    const dep = await prisma.deposito.findUnique({ where: { id: idDeposito } });
    if (!dep) throw new Error('Depósito inexistente');

    const productosIds = items.map(i => i.idProducto);
    const productosOK = await prisma.producto.findMany({ where: { idProducto: { in: productosIds } } });
    const encontrados = new Set(productosOK.map(p => p.idProducto));
    const faltantes = productosIds.filter(id => !encontrados.has(id));
    if (faltantes.length) throw new Error(`Productos inexistentes: ${faltantes.join(', ')}`);

    // upsert en transacción
    await prisma.$transaction(
      items.map(i =>
        prisma.inventario.upsert({
          where: { idDeposito_idProducto: { idDeposito, idProducto: i.idProducto } },
          update: { umbralMin: i.umbralMin },
          create: { idDeposito, idProducto: i.idProducto, cantidadProducto: 0, umbralMin: i.umbralMin },
        })
      )
    );

    // devuelvo estado actualizado del depósito
    return this.listByDeposito(idDeposito);
  },
};
