import { prisma } from "../lib/prisma";

export class FormulasRepository {
  async findAll({ estado, search }: { estado?: string; search?: string }) {
    return prisma.formula.findMany({
      where: {
        activo: true,
        ...(estado === "protegida" ? { esProtegida: true } : {}),
        ...(estado === "no_protegida" ? { esProtegida: false } : {}),
        ...(search
          ? { nombre: { contains: search, mode: "insensitive" } }
          : {}),
      },
      orderBy: { nombre: "asc" },
      include: {
        formulaInsumos: {
          include: { insumo: true },
        },
      },
    });
  }

  async findById(id: number) {
    return prisma.formula.findUnique({
      where: { id },
      include: {
        formulaInsumos: {
          include: { insumo: true },
        },
      },
    });
  }

  async create(data: any, insumos: any[]) {
    return prisma.$transaction(async (tx) => {
      const formula = await tx.formula.create({ data });
      for (const fi of insumos) {
        await tx.formulaInsumo.create({
          data: {
            idFormula: formula.id,
            idInsumo: fi.idInsumo,
            cantidadInsumo: fi.cantidadInsumo,
          },
        });
      }
      // Retornar la fórmula completa con los insumos usando la transacción
      return tx.formula.findUnique({
        where: { id: formula.id },
        include: {
          formulaInsumos: {
            include: { insumo: true },
          },
        },
      });
    });
  }

  async update(id: number, data: any, insumos: any[]) {
    return prisma.$transaction(async (tx) => {
      const formula = await tx.formula.update({ where: { id }, data });
      await tx.formulaInsumo.deleteMany({ where: { idFormula: id } });
      for (const fi of insumos) {
        await tx.formulaInsumo.create({
          data: {
            idFormula: id,
            idInsumo: fi.idInsumo,
            cantidadInsumo: fi.cantidadInsumo,
          },
        });
      }
      // Retornar la fórmula completa con los insumos usando la transacción
      return tx.formula.findUnique({
        where: { id },
        include: {
          formulaInsumos: {
            include: { insumo: true },
          },
        },
      });
    });
  }

  async softDelete(id: number) {
    return prisma.formula.update({ where: { id }, data: { activo: false } });
  }
}
