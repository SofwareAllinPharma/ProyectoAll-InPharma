import { prisma } from "../lib/prisma";

export class ProductosRepository {
  async findAll({
    search,
    formula,
    insumo,
  }: {
    search?: string;
    formula?: string;
    insumo?: string;
  }) {
    return prisma.producto.findMany({
      where: {
        estaActivo: true,
        ...(search
          ? { nombreComercial: { contains: search, mode: "insensitive" } }
          : {}),
        ...(formula
          ? { formula: { nombre: { contains: formula, mode: "insensitive" } } }
          : {}),
        ...(insumo
          ? {
              formula: {
                formulaInsumos: {
                  some: {
                    insumo: {
                      nombre: { contains: insumo, mode: "insensitive" },
                    },
                  },
                },
              },
            }
          : {}),
      },
      include: {
        formula: {
          include: {
            formulaInsumos: { include: { insumo: true } },
          },
        },
      },
      orderBy: { nombreComercial: "asc" },
    });
  }

  async findById(idProducto: number) {
    return prisma.producto.findUnique({
      where: { idProducto },
      include: {
        formula: {
          include: {
            formulaInsumos: { include: { insumo: true } },
          },
        },
      },
    });
  }

  async create(data: any) {
    return prisma.producto.create({ data });
  }

  async update(idProducto: number, data: any) {
    return prisma.producto.update({ where: { idProducto }, data });
  }

  async softDelete(idProducto: number) {
    return prisma.producto.update({
      where: { idProducto },
      data: { estaActivo: false },
    });
  }
}
