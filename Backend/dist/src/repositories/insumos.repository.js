"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsumosRepository = void 0;
const prisma_1 = require("../lib/prisma");
class InsumosRepository {
    async findAll() {
        return prisma_1.prisma.insumo.findMany({
            where: { activo: true },
            orderBy: { nombre: "asc" },
        });
    }
    async findById(id) {
        return prisma_1.prisma.insumo.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma_1.prisma.insumo.create({ data });
    }
    async update(id, data) {
        return prisma_1.prisma.insumo.update({ where: { id }, data });
    }
    async delete(id) {
        await prisma_1.prisma.insumo.update({ where: { id }, data: { activo: false } });
    }
}
exports.InsumosRepository = InsumosRepository;
