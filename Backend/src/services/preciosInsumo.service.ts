import { prisma } from '../lib/prisma';

export class PreciosInsumoService {
  async listByInsumo(idInsumo: number) {
    const insumo = await prisma.insumo.findUnique({ where: { id: idInsumo } });
    if (!insumo) throw new Error('Insumo no encontrado');
    return prisma.precioInsumo.findMany({
      where: { idInsumo },
      include: { proveedor: true },
      orderBy: [{ activo: 'desc' }, { fechaDesde: 'desc' }],
    });
  }

  async setNuevoPrecio(
    idInsumo: number,
    data: { idProveedor: number; precioPorKg: number; observacion?: string }
  ) {
    const insumo = await prisma.insumo.findUnique({ where: { id: idInsumo } });
    if (!insumo || !insumo.activo) throw new Error('Insumo no encontrado');

    const proveedor = await prisma.proveedor.findUnique({ where: { id: data.idProveedor } });
    if (!proveedor || !proveedor.activo) throw new Error('Proveedor no encontrado');

    if (!Number.isFinite(data.precioPorKg) || data.precioPorKg <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    return prisma.$transaction(async (tx) => {
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
          observacion: data.observacion?.trim() || null,
          activo: true,
          fechaDesde: ahora,
        },
        include: { proveedor: true },
      });
    });
  }

  async deletePrecio(idInsumo: number, precioId: number) {
    const precio = await prisma.precioInsumo.findFirst({
      where: { id: precioId, idInsumo },
    });
    if (!precio) throw new Error('Registro de precio no encontrado');
    if (precio.activo) {
      throw new Error('No se puede eliminar el precio vigente. Cargá uno nuevo para reemplazarlo.');
    }
    return prisma.precioInsumo.delete({ where: { id: precioId } });
  }
}
