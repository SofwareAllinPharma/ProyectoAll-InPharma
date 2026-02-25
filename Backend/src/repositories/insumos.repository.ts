import { prisma } from "../lib/prisma";
import { Insumo } from "@prisma/client";

export class InsumosRepository {
  async findAll(): Promise<Insumo[]> {
    return prisma.insumo.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
  }

  async findById(id: number): Promise<Insumo | null> {
    return prisma.insumo.findUnique({ where: { id } });
  }

  async create(data: Omit<Insumo, "id">): Promise<Insumo> {
    return prisma.insumo.create({ data });
  }

  async update(id: number, data: Partial<Omit<Insumo, "id">>): Promise<Insumo> {
    const d = data as any;

    // Build payload with only the fields that were provided, coercing numeric nulls to 0
    const updateData: Record<string, any> = {};

    if (d.nombre !== undefined) updateData.nombre = d.nombre;
    if (d.cal_100g !== undefined) updateData.cal_100g = Number(d.cal_100g) || 0;
    if (d.grasasTotales_100g !== undefined) updateData.grasasTotales_100g = Number(d.grasasTotales_100g) || 0;
    if (d.grasasTrans_100g !== undefined) updateData.grasasTrans_100g = Number(d.grasasTrans_100g) || 0;
    if (d.grasasSaturadas_100g !== undefined) updateData.grasasSaturadas_100g = Number(d.grasasSaturadas_100g) || 0;
    if (d.proteinas_100g !== undefined) updateData.proteinas_100g = Number(d.proteinas_100g) || 0;
    if (d.carbohidratos_100g !== undefined) updateData.carbohidratos_100g = Number(d.carbohidratos_100g) || 0;
    if (d.sodio_100g !== undefined) updateData.sodio_100g = Number(d.sodio_100g) || 0;
    if (d.fibra_100g !== undefined) updateData.fibra_100g = Number(d.fibra_100g) || 0;
    if (d.otro_100g !== undefined) updateData.otro_100g = Number(d.otro_100g) || 0;
    if (d.activo !== undefined) updateData.activo = d.activo;

    // otroAlias is nullable — empty string becomes null
    if ('otroAlias' in d) {
      updateData.otroAlias = d.otroAlias?.trim() || null;
    }

    return prisma.insumo.update({ where: { id }, data: updateData });
  }

  async delete(id: number): Promise<Insumo> {
    return prisma.insumo.update({
      where: { id },
      data: { activo: false },
    });
  }
}
