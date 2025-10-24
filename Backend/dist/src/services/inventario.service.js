"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioService = void 0;
const client_1 = require("@prisma/client");
const inventario_estado_1 = require("./inventario.estado");
const prisma = new client_1.PrismaClient();
exports.InventarioService = {
    /** Para configuración de umbrales: todos los productos activos, con o sin stock */
    async listProductosConUmbral(idDeposito) {
        // Traer todos los productos activos
        const productos = await prisma.producto.findMany({
            where: { estaActivo: true },
            select: { idProducto: true, nombreComercial: true },
            orderBy: { nombreComercial: 'asc' },
        });
        // Traer inventario existente para el depósito
        const inventario = await prisma.inventario.findMany({
            where: { idDeposito },
            select: { idProducto: true, cantidadProducto: true, umbralMin: true },
        });
        const inventarioMap = Object.fromEntries(inventario.map(i => [i.idProducto, i]));
        // Unir productos con inventario (si existe)
        return productos.map(p => {
            const inv = inventarioMap[p.idProducto];
            const cantidadProducto = inv ? inv.cantidadProducto : null;
            const umbralMin = inv ? inv.umbralMin : null;
            const estado = (0, inventario_estado_1.calcularEstado)(cantidadProducto ?? 0, umbralMin);
            return {
                idProducto: p.idProducto,
                nombreComercial: p.nombreComercial,
                cantidadProducto,
                umbralMin,
                estado,
            };
        });
    },
    /** Para la tabla de inventario: solo productos con stock en el depósito (independiente de umbral) */
    async listInventarioByDeposito(idDeposito) {
        // Traer inventario con cantidad > 0 y producto activo
        const inventario = await prisma.inventario.findMany({
            where: {
                idDeposito,
                cantidadProducto: { gt: 0 },
                producto: { estaActivo: true },
            },
            include: { producto: { select: { idProducto: true, nombreComercial: true } } },
            orderBy: { producto: { nombreComercial: 'asc' } },
        });
        return inventario.map(r => ({
            idProducto: r.idProducto,
            nombreComercial: r.producto?.nombreComercial ?? '',
            cantidadProducto: r.cantidadProducto,
            umbralMin: r.umbralMin,
            estado: (0, inventario_estado_1.calcularEstado)(r.cantidadProducto, r.umbralMin),
            updatedAt: r.updatedAt ?? null,
        }));
    },
    /** Resumen (totales por estado) para las cards/filtros del depósito */
    async resumenEstados(idDeposito) {
        const rows = await prisma.inventario.findMany({
            where: {
                idDeposito,
                cantidadProducto: { gt: 0 },
                producto: { estaActivo: true },
            },
            select: { cantidadProducto: true, umbralMin: true },
        });
        const counters = { critico: 0, bajo: 0, normal: 0, default: 0 };
        for (const r of rows) {
            counters[(0, inventario_estado_1.calcularEstado)(r.cantidadProducto, r.umbralMin ?? null)]++;
        }
        return {
            total: rows.length,
            normal: counters.normal,
            bajo: counters.bajo,
            critico: counters.critico,
            default: counters.default,
        };
    },
    /** Bulk “Guardar todos” (queda igual a tu última versión) */
    async bulkUpsertUmbralMin(idDeposito, items) {
        if (!Number.isInteger(idDeposito) || idDeposito <= 0)
            throw new Error('idDeposito inválido');
        items.forEach(i => {
            if (!Number.isFinite(i.umbralMin) || i.umbralMin < 0)
                throw new Error('umbralMin debe ser un entero >= 0');
        });
        const dep = await prisma.deposito.findUnique({ where: { id: idDeposito } });
        if (!dep)
            throw new Error('Depósito inexistente');
        const productosIds = items.map(i => i.idProducto);
        const existentes = new Set((await prisma.producto.findMany({ where: { idProducto: { in: productosIds } }, select: { idProducto: true } }))
            .map(p => p.idProducto));
        const faltantes = productosIds.filter(id => !existentes.has(id));
        if (faltantes.length)
            throw new Error(`Productos inexistentes: ${faltantes.join(', ')}`);
        await prisma.$transaction(items.map(i => prisma.inventario.upsert({
            where: { idDeposito_idProducto: { idDeposito, idProducto: i.idProducto } },
            update: { umbralMin: i.umbralMin },
            create: { idDeposito, idProducto: i.idProducto, cantidadProducto: 0, umbralMin: i.umbralMin },
        })));
        // devolvemos con estado
        const data = await prisma.inventario.findMany({
            where: { idDeposito },
            include: { producto: { select: { idProducto: true, nombreComercial: true } } },
            orderBy: [{ producto: { nombreComercial: 'asc' } }],
        });
        return data.map(r => ({ ...r, estado: (0, inventario_estado_1.calcularEstado)(r.cantidadProducto, r.umbralMin ?? null), ultimaActualizacion: null }));
    },
};
