"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidosController = void 0;
const pedidos_service_1 = require("../services/pedidos.service");
const service = new pedidos_service_1.PedidosService();
class PedidosController {
    async list(req, res) {
        try {
            const pagina = Number(req.query.pagina ?? 1);
            const pageSize = Number(req.query.pageSize ?? 10);
            const data = await service.list({ pagina, pageSize });
            res.json(data);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async detail(req, res) {
        try {
            const numPedido = Number(req.params.id);
            const data = await service.detail(numPedido);
            res.json(data);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async create(req, res) {
        try {
            const data = await service.create(req.body);
            res.status(201).json(data);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async tomar(req, res) {
        try {
            const numPedido = Number(req.params.id);
            const data = await service.tomarPedido(numPedido, req.body);
            res.json(data);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async finalizar(req, res) {
        try {
            const numPedido = Number(req.params.id);
            const data = await service.finalizarElaboracion(numPedido);
            res.json(data);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async iniciarElaboracion(req, res) {
        try {
            const numPedido = Number(req.params.id);
            const data = await service.iniciarElaboracion(numPedido);
            res.json(data);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async finalizarElaboracion(req, res) {
        try {
            const numPedido = Number(req.params.id);
            const data = await service.finalizarElaboracion(numPedido);
            res.json(data);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async aprobar(req, res) {
        try {
            const numPedido = Number(req.params.id);
            const data = await service.aprobar(numPedido);
            res.json(data);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async rechazar(req, res) {
        try {
            const numPedido = Number(req.params.id);
            const data = await service.rechazar(numPedido);
            res.json(data);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async cancelar(req, res) {
        try {
            const numPedido = Number(req.params.id);
            const data = await service.cancelar(numPedido);
            res.json(data);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
exports.PedidosController = PedidosController;
