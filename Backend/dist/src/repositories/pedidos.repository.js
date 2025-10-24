"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidosRepository = void 0;
const prisma_1 = require("../lib/prisma");
class PedidosRepository {
    async list(pagina, pageSize) {
        const skip = (pagina - 1) * pageSize;
        const [items, total] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.pedido.findMany({
                include: {
                    producto: { include: { formula: true } },
                    cambioActual: { include: { estado: true } },
                },
                orderBy: [{ estaAsignado: "asc" }, { createdAt: "asc" }],
                skip,
                take: pageSize,
            }),
            prisma_1.prisma.pedido.count(),
        ]);
        return {
            items,
            total,
            pagina,
            pageSize,
            paginas: Math.ceil(total / pageSize),
        };
    }
    async findById(numPedido) {
        return prisma_1.prisma.pedido.findUnique({
            where: { numPedido },
            include: {
                producto: { include: { formula: true } },
                cambioActual: { include: { estado: true } },
                cambios: {
                    include: { estado: true },
                    orderBy: { idCambioEstado: "asc" },
                },
            },
        });
    }
    async createWithEstadoCreado(data, estadoCreadoId) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const pedido = await tx.pedido.create({ data });
            const cambio = await tx.cambioEstadoPedido.create({
                data: {
                    idPedido: pedido.numPedido,
                    idEstadoPedido: estadoCreadoId,
                    fechaHoraInicio: new Date(),
                },
            });
            await tx.pedido.update({
                where: { numPedido: pedido.numPedido },
                data: { idCambioEstadoPedido: cambio.idCambioEstado },
            });
            return tx.pedido.findUnique({
                where: { numPedido: pedido.numPedido },
                include: {
                    cambioActual: { include: { estado: true } },
                    producto: { include: { formula: true } },
                },
            });
        });
    }
    async transition(numPedido, nextEstadoId, extraData = {}) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const pedido = await tx.pedido.findUnique({
                where: { numPedido },
                include: { cambioActual: true },
            });
            if (!pedido)
                throw new Error("Pedido no encontrado");
            if (pedido.idCambioEstadoPedido) {
                await tx.cambioEstadoPedido.update({
                    where: { idCambioEstado: pedido.idCambioEstadoPedido },
                    data: { fechaHoraFin: new Date() },
                });
            }
            const nuevoCambio = await tx.cambioEstadoPedido.create({
                data: {
                    idPedido: numPedido,
                    idEstadoPedido: nextEstadoId,
                    fechaHoraInicio: new Date(),
                },
            });
            const updated = await tx.pedido.update({
                where: { numPedido },
                data: {
                    idCambioEstadoPedido: nuevoCambio.idCambioEstado,
                    ...extraData,
                },
                include: {
                    cambioActual: { include: { estado: true } },
                    producto: { include: { formula: true } },
                },
            });
            return updated;
        });
    }
    async existsPedidoNoCanceladoForProducto(idProducto, estadosNoPermitidos) {
        return prisma_1.prisma.pedido.findFirst({
            where: {
                idProducto,
                cambioActual: { estado: { nombre: { in: estadosNoPermitidos } } },
            },
            include: { cambioActual: { include: { estado: true } } },
        });
    }
}
exports.PedidosRepository = PedidosRepository;
