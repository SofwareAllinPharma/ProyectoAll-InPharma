"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsumosRepository = void 0;
const prisma_1 = require("../lib/prisma");
class InsumosRepository {
    async findAll() {
        // Ordenar por nombre ignorando mayúsculas/minúsculas y usando el nombre real de la tabla
        return prisma_1.prisma.$queryRaw `
      SELECT * FROM "INSUMOS" ORDER BY LOWER(nombre) ASC
    `;
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
        return prisma_1.prisma.insumo.delete({ where: { id } });
    }
}
exports.InsumosRepository = InsumosRepository;
