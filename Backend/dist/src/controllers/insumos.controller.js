"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsumosController = void 0;
const insumos_service_1 = require("../services/insumos.service");
const insumosService = new insumos_service_1.InsumosService();
class InsumosController {
    async getAll(req, res) {
        const insumos = await insumosService.getAll();
        res.json(insumos);
    }
    async getById(req, res) {
        const id = Number(req.params.id);
        const insumo = await insumosService.getById(id);
        if (!insumo) {
            return res.status(404).json({ error: "Insumo no encontrado" });
        }
        res.json(insumo);
    }
    async create(req, res) {
        try {
            const nuevo = await insumosService.create(req.body);
            res.status(201).json(nuevo);
        }
        catch (error) {
            if ((error.code === "P2002" &&
                error.meta &&
                error.meta.target &&
                error.meta.target.includes("nombre")) ||
                (typeof error.message === "string" &&
                    error.message.includes("Unique constraint failed") &&
                    error.message.includes("nombre"))) {
                return res
                    .status(409)
                    .json({ error: "Ya existe un insumo con ese nombre." });
            }
            res.status(400).json({ error: error.message });
        }
    }
    async update(req, res) {
        const id = Number(req.params.id);
        try {
            const actualizado = await insumosService.update(id, req.body);
            res.json(actualizado);
        }
        catch (error) {
            if (error.code === "P2025" ||
                (typeof error.message === "string" &&
                    error.message.includes("No record was found for an update"))) {
                return res
                    .status(404)
                    .json({ error: "No se encontró el insumo para modificar." });
            }
            res.status(400).json({ error: error.message });
        }
    }
    async delete(req, res) {
        const id = Number(req.params.id);
        try {
            const eliminado = await insumosService.delete(id);
            res.json(eliminado);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.InsumosController = InsumosController;
