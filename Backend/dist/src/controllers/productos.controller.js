"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductosController = void 0;
const productos_service_1 = require("../services/productos.service");
const service = new productos_service_1.ProductosService();
class ProductosController {
    async list(req, res) {
        try {
            const { search, formula, insumo } = req.query;
            const productos = await service.list({
                search: search,
                formula: formula,
                insumo: insumo,
            });
            res.json(productos);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async detail(req, res) {
        try {
            const { id } = req.params;
            const producto = await service.detail(Number(id));
            if (!producto)
                return res.status(404).json({ error: "No encontrado" });
            res.json(producto);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async create(req, res) {
        try {
            const dto = req.body;
            const producto = await service.createProducto(dto);
            res.status(201).json(producto);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const dto = req.body;
            const producto = await service.updateProducto(Number(id), dto);
            res.json(producto);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await service.softDeleteProducto(Number(id));
            res.json({ success: true });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
exports.ProductosController = ProductosController;
