"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulasController = void 0;
const formulas_service_1 = require("../services/formulas.service");
const service = new formulas_service_1.FormulasService();
class FormulasController {
    async list(req, res) {
        try {
            const { estado, search } = req.query;
            const formulas = await service.list({
                estado: estado,
                search: search,
            });
            res.json(formulas);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async detail(req, res) {
        try {
            const { id } = req.params;
            const formula = await service.detail(Number(id));
            if (!formula)
                return res.status(404).json({ error: "No encontrada" });
            res.json(formula);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async create(req, res) {
        try {
            const dto = req.body;
            // No validar dto.porcion, se calcula en el service
            const formula = await service.createFormula(dto);
            res.status(201).json(formula);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const dto = req.body;
            const formula = await service.updateFormula(Number(id), dto);
            res.json(formula);
        }
        catch (err) {
            if (err.code === "P2002" && err.meta?.target?.includes("nombre")) {
                return res
                    .status(400)
                    .json({ error: "Ya existe una fórmula con ese nombre." });
            }
            res.status(400).json({ error: err.message });
        }
    }
    async clone(req, res) {
        try {
            const { id } = req.params;
            const dto = req.body;
            // El service fuerza esProtegida: false
            const formula = await service.cloneFormula(Number(id), dto);
            res.status(201).json(formula);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await service.softDeleteFormula(Number(id));
            res.json({ success: true });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
exports.FormulasController = FormulasController;
