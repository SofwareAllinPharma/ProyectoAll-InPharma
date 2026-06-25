import { prisma } from '../lib/prisma';

export class ProveedoresService {
  async list() {
    return prisma.proveedor.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async create(data: {
    nombre: string;
    telefono?: string;
    email?: string;
    cuit?: string;
    razonSocial?: string;
  }) {
    if (!data.nombre?.trim()) throw new Error('El nombre del proveedor es obligatorio');
    return prisma.proveedor.create({
      data: {
        nombre: data.nombre.trim(),
        telefono: data.telefono?.trim() || null,
        email: data.email?.trim() || null,
        cuit: data.cuit?.trim() || null,
        razonSocial: data.razonSocial?.trim() || null,
      },
    });
  }

  async update(
    id: number,
    data: {
      nombre?: string;
      telefono?: string | null;
      email?: string | null;
      cuit?: string | null;
      razonSocial?: string | null;
    }
  ) {
    const existing = await prisma.proveedor.findUnique({ where: { id } });
    if (!existing || !existing.activo) throw new Error('Proveedor no encontrado');
    if (data.nombre !== undefined && !data.nombre.trim()) throw new Error('El nombre no puede estar vacío');
    return prisma.proveedor.update({
      where: { id },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre.trim() }),
        ...(data.telefono !== undefined && { telefono: data.telefono?.trim() || null }),
        ...(data.email !== undefined && { email: data.email?.trim() || null }),
        ...(data.cuit !== undefined && { cuit: data.cuit?.trim() || null }),
        ...(data.razonSocial !== undefined && { razonSocial: data.razonSocial?.trim() || null }),
      },
    });
  }

  async remove(id: number) {
    const existing = await prisma.proveedor.findUnique({
      where: { id },
      include: { precios: { where: { activo: true }, take: 1 } },
    });
    if (!existing || !existing.activo) throw new Error('Proveedor no encontrado');
    if (existing.precios.length > 0) {
      throw new Error('No se puede eliminar un proveedor con precios activos. Primero actualizá los precios de los insumos asociados.');
    }
    return prisma.proveedor.update({ where: { id }, data: { activo: false } });
  }
}
