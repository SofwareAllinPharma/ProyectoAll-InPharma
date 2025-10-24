"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulasRepository = void 0;
const prisma_1 = require("../lib/prisma");
class FormulasRepository {
    async findAll({ estado, search }) {
        return prisma_1.prisma.formula.findMany({
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
    async findById(id) {
        return prisma_1.prisma.formula.findUnique({
            where: { id },
            include: {
                formulaInsumos: {
                    include: { insumo: true },
                },
            },
        });
    }
    async create(data, insumos) {
        return prisma_1.prisma.$transaction(async (tx) => {
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
    async update(id, data, insumos) {
        return prisma_1.prisma.$transaction(async (tx) => {
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
    async softDelete(id) {
        return prisma_1.prisma.formula.update({ where: { id }, data: { activo: false } });
    }
}
exports.FormulasRepository = FormulasRepository;
