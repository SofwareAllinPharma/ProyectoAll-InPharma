import { cotizacionParaPrecios, presentarPrecio } from './cotizacionBlue';
import { prisma } from '../lib/prisma';

export class PreciosInsumoService {
  async listByInsumo(idInsumo: number) {
    const insumo = await prisma.insumo.findUnique({ where: { id: idInsumo } });
    if (!insumo) throw new Error('Insumo no encontrado');
    const precios = await prisma.precioInsumo.findMany({
      where: { idInsumo },
      include: { proveedor: true },
      orderBy: [{ activo: 'desc' }, { fechaDesde: 'desc' }],
    });
    const blue = await cotizacionParaPrecios(precios);
    return precios.map(p => presentarPrecio(p, blue));
  }

  async setNuevoPrecio(
    idInsumo: number,
    data: { idProveedor: number; precioPorKg: number; moneda?: string; observacion?: string }
  ) {
    const moneda = data.moneda ?? 'ARS';
    if (moneda !== 'ARS' && moneda !== 'USD') throw new Error('Moneda inválida');
    const insumo = await prisma.insumo.findUnique({ where: { id: idInsumo } });
    if (!insumo || !insumo.activo) throw new Error('Insumo no encontrado');

    const proveedor = await prisma.proveedor.findUnique({ where: { id: data.idProveedor } });
    if (!proveedor || !proveedor.activo) throw new Error('Proveedor no encontrado');

    if (!Number.isFinite(data.precioPorKg) || data.precioPorKg <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    return prisma.$transaction(async (tx) => {
      // Serializa cambios del mismo insumo entre instancias del backend.
      await tx.$queryRaw`SELECT "id" FROM "INSUMOS" WHERE "id" = ${idInsumo} FOR UPDATE`;
      const ahora = new Date();

      // Desactivar precio anterior si existe
      await tx.precioInsumo.updateMany({
        where: { idInsumo, activo: true },
        data: { activo: false, fechaHasta: ahora },
      });

      // Crear nuevo precio activo
      return tx.precioInsumo.create({
        data: {
          idInsumo,
          idProveedor: data.idProveedor,
          precioPorKg: data.precioPorKg,
          moneda,
          observacion: data.observacion?.trim() || null,
          activo: true,
          fechaDesde: ahora,
        },
        include: { proveedor: true },
      });
    });
  }

  async deletePrecio(_idInsumo: number, _precioId: number) {
    throw new Error('El historial de precios se conserva. Cargá un nuevo precio para reemplazar el vigente.');
  }
}
