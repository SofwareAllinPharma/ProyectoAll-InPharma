import { prisma } from "../lib/prisma";
import { Insumo } from "@prisma/client";

export class InsumosRepository {
  async findAll(): Promise<Insumo[]> {
    // Ordenar por nombre ignorando mayúsculas/minúsculas y usando el nombre real de la tabla
    return prisma.$queryRaw<Insumo[]>`
      SELECT * FROM "INSUMOS" ORDER BY LOWER(nombre) ASC
    `;
  }

  async findById(id: number): Promise<Insumo | null> {
    return prisma.insumo.findUnique({ where: { id } });
  }

  async create(data: Omit<Insumo, "id">): Promise<Insumo> {
    return prisma.insumo.create({ data });
  }

  async update(id: number, data: Partial<Omit<Insumo, "id">>): Promise<Insumo> {
    return prisma.insumo.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Insumo> {
    return prisma.insumo.delete({ where: { id } });
  }
}
