import { prisma } from '../lib/prisma';
import type { Prisma } from '@prisma/client';

// === Tipos derivados del delegate (v6-friendly) ===
type CreateData = Prisma.Args<typeof prisma.insumo, 'create'>['data'];
type UpdateData = Prisma.Args<typeof prisma.insumo, 'update'>['data'];
type Entity     = Awaited<ReturnType<typeof prisma.insumo.findFirst>>;

export class InsumosRepository {
  async findAll() {
    return prisma.insumo.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findById(id: number) {
    return prisma.insumo.findUnique({ where: { id } });
  }

  async create(data: CreateData) {
    return prisma.insumo.create({ data });
  }

  async update(id: number, data: UpdateData) {
    return prisma.insumo.update({ where: { id }, data });
  }

  async delete(id: number) {
    await prisma.insumo.delete({ where: { id } });
  }
}
