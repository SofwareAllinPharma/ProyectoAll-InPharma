import { calcularComposicion } from '../services/composicion';
import { bloquearCatalogoComposicion } from '../services/composicion';
import { prisma } from "../lib/prisma";

export class FormulasRepository {
  async findAll({
    estado,
    search,
    insumoId,
  }: {
    estado?: string;
    search?: string;
    insumoId?: number;
  }) {
    return prisma.formula.findMany({
      where: {
        activo: true,
        tipoComposicion: "reutilizable",
        ...(estado === "protegida" ? { esProtegida: true } : {}),
        ...(estado === "no_protegida" ? { esProtegida: false } : {}),
        ...(search
          ? { nombre: { contains: search, mode: "insensitive" } }
          : {}),
        ...(insumoId
          ? {
              formulaInsumos: {
                some: {
                  idInsumo: insumoId,
                },
              },
            }
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
    return prisma.formula.findFirst({
      where: { id, tipoComposicion: "reutilizable" },
      include: {
        formulaInsumos: {
          include: { insumo: true },
        },
      },
    });
  }

  async create(data: any, insumos: any[]) {
    return prisma.$transaction(async (tx) => {
      await bloquearCatalogoComposicion(tx);
      const { lineas, ...nutrientes } = await calcularComposicion(tx, insumos);
      const formula = await tx.formula.create({ data: { ...data, ...nutrientes } });
      for (const fi of lineas) {
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
      await bloquearCatalogoComposicion(tx);
      await tx.$queryRaw`SELECT "id" FROM "FORMULA" WHERE "id" = ${id} FOR UPDATE`;
      const actual = await tx.formula.findUnique({ where: { id } });
      if (!actual || actual.tipoComposicion !== 'reutilizable') throw new Error('Fórmula reutilizable no encontrada');
      if (actual.esProtegida) throw new Error('No se puede modificar una fórmula protegida');
      const { lineas, ...nutrientes } = await calcularComposicion(tx, insumos);
      const formula = await tx.formula.update({ where: { id }, data: { ...data, ...nutrientes } });
      await tx.formulaInsumo.deleteMany({ where: { idFormula: id } });
      for (const fi of lineas) {
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
    return prisma.$transaction(async (tx) => {
      await bloquearCatalogoComposicion(tx);
      await tx.$queryRaw`SELECT "id" FROM "FORMULA" WHERE "id" = ${id} FOR UPDATE`;
      const actual = await tx.formula.findUnique({ where: { id } });
      if (!actual || actual.tipoComposicion !== 'reutilizable') throw new Error('Fórmula reutilizable no encontrada');
      if (actual.esProtegida) throw new Error('No se puede eliminar una fórmula protegida');
      if (await tx.producto.count({ where: { idFormula: id } })) throw new Error('La fórmula tiene productos asociados');
      return tx.formula.update({ where: { id }, data: { activo: false } });
    });
  }
}
