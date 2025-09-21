import { prisma } from "../lib/prisma";
import { Insumos } from "@prisma/client";

export class InsumosRepository {
  async findAll(): Promise<Insumos[]> {
    // Ordenar por nombre ignorando mayúsculas/minúsculas y usando el nombre real de la tabla
    return prisma.$queryRaw<Insumos[]>`
      SELECT * FROM "INSUMOS" ORDER BY LOWER(nombre) ASC
    `;
  }

  async findById(id: number): Promise<Insumos | null> {
    return prisma.insumos.findUnique({ where: { id } });
  }

  async create(data: Omit<Insumos, "id">): Promise<Insumos> {
    return prisma.insumos.create({ data });
  }

  async update(
    id: number,
    data: Partial<Omit<Insumos, "id">>
  ): Promise<Insumos> {
    return prisma.insumos.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Insumos> {
    return prisma.insumos.delete({ where: { id } });
  }
}
