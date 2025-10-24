"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioController = void 0;
const inventario_service_1 = require("../services/inventario.service");
function parseId(n, name) {
    const v = Number(n);
    if (!Number.isInteger(v) || v <= 0)
        throw Object.assign(new Error(`${name} inválido`), { status: 400 });
    return v;
}
exports.InventarioController = {
    // PUT /inventario/:idDeposito/umbrales  (bulk: { items: [{idProducto, umbralMin}, ...] })
    async bulkUpsertUmbralMin(req, res) {
        try {
            const idDeposito = parseId(req.params.idDeposito, 'idDeposito');
            const items = Array.isArray(req.body?.items) ? req.body.items : [];
            if (!items.length)
                return res.status(400).json({ message: 'items vacío' });
            const updated = await inventario_service_1.InventarioService.bulkUpsertUmbralMin(idDeposito, items);
            return res.json(updated);
        }
        catch (e) {
            return res.status(400).json({ message: e.message ?? 'Datos inválidos' });
        }
    },
    // GET /inventario/:idDeposito
    async listInventarioByDeposito(req, res) {
        try {
            const idDeposito = parseId(req.params.idDeposito, 'idDeposito');
            const data = await inventario_service_1.InventarioService.listInventarioByDeposito(idDeposito);
            res.json(data);
        }
        catch (e) {
            res.status(e.status ?? 500).json({ message: e.message ?? 'Error interno' });
        }
    },
    // GET /inventario/:idDeposito/umbrales-config
    async listProductosConUmbral(req, res) {
        try {
            const idDeposito = parseId(req.params.idDeposito, 'idDeposito');
            const data = await inventario_service_1.InventarioService.listProductosConUmbral(idDeposito);
            res.json(data);
        }
        catch (e) {
            res.status(e.status ?? 500).json({ message: e.message ?? 'Error interno' });
        }
    },
    // GET /inventario/:idDeposito/resumen-estados
    async resumenEstados(req, res) {
        try {
            const idDeposito = parseId(req.params.idDeposito, 'idDeposito');
            const data = await inventario_service_1.InventarioService.resumenEstados(idDeposito);
            res.json(data);
        }
        catch (e) {
            res.status(e.status ?? 500).json({ message: e.message ?? 'Error interno' });
        }
    },
};
