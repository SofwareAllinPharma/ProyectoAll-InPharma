"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositosService = void 0;
const prisma_1 = require("../lib/prisma");
class DepositosService {
    //Crear un nuevo depósito
    async create(data) {
        const { nombre, direccion, responsable, capacidadTotal, estado } = data;
        return prisma_1.prisma.deposito.create({
            data: {
                nombre,
                direccion,
                responsable,
                capacidadTotal,
                ...(typeof estado === "boolean" ? { estado } : {}), // si no viene, DB aplica default true
            },
        });
    }
    //Consultar todos los depósitos
    async findAll() {
        // solo activos
        return prisma_1.prisma.deposito.findMany({
            where: { estado: true },
            orderBy: { id: "asc" },
        });
    }
    //Consultar por ID
    async findById(id) {
        return prisma_1.prisma.deposito.findUnique({
            where: { id },
        });
    }
    // ✅ Modificar solo responsable y capacidadTotal
    async update(id, data) {
        if (data.capacidadTotal !== undefined &&
            (Number.isNaN(data.capacidadTotal) || data.capacidadTotal < 0)) {
            throw new Error("capacidadTotal debe ser un número >= 0.");
        }
        return prisma_1.prisma.deposito.update({
            where: { id },
            data: {
                ...(data.responsable !== undefined
                    ? { responsable: data.responsable }
                    : {}),
                ...(data.capacidadTotal !== undefined
                    ? { capacidadTotal: data.capacidadTotal }
                    : {}),
            },
        });
    }
    /**
     * Baja lógica (desactivar) cumpliendo reglas:
     * - Stock total del depósito = 0
     * - Sin movimientos pendientes
     * aún no tiene tablas de stock/movimientos,
     * métodos del service (getStockTotalEnDeposito y tieneMovimientosPendientes
     */
    async deactivate(id) {
        return prisma_1.prisma.deposito.update({
            where: { id },
            data: { estado: false },
        });
    }
}
exports.DepositosService = DepositosService;
