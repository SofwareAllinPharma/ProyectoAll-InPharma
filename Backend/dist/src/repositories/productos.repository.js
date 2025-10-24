"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductosRepository = void 0;
const prisma_1 = require("../lib/prisma");
class ProductosRepository {
    async findAll({ search, formula, insumo, }) {
        return prisma_1.prisma.producto.findMany({
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
    async findById(idProducto) {
        return prisma_1.prisma.producto.findUnique({
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
    async create(data) {
        return prisma_1.prisma.producto.create({ data });
    }
    async update(idProducto, data) {
        return prisma_1.prisma.producto.update({ where: { idProducto }, data });
    }
    async softDelete(idProducto) {
        return prisma_1.prisma.producto.update({
            where: { idProducto },
            data: { estaActivo: false },
        });
    }
}
exports.ProductosRepository = ProductosRepository;
