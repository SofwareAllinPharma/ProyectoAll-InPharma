"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioGlobalController = void 0;
const inventarioGlobal_service_1 = require("../services/inventarioGlobal.service");
exports.InventarioGlobalController = {
    // GET /inventario-global
    async list(req, res) {
        try {
            const { q, sort, order } = req.query;
            const data = await inventarioGlobal_service_1.InventarioGlobalService.listGlobal({ q, sort, order });
            res.json(data);
        }
        catch (e) {
            res.status(500).json({ message: e.message ?? 'Error interno' });
        }
    },
    // GET /inventario-global/resumen-estados
    async resumen(req, res) {
        try {
            const data = await inventarioGlobal_service_1.InventarioGlobalService.resumenEstadosGlobal();
            res.json(data);
        }
        catch (e) {
            res.status(500).json({ message: e.message ?? 'Error interno' });
        }
    },
};
