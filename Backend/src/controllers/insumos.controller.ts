import { Request, Response } from "express";
import { InsumosService } from "../services/insumos.service";

const insumosService = new InsumosService();

export class InsumosController {
  async getAll(req: Request, res: Response) {
    try {
      const insumos = await insumosService.getAll();
      res.json(insumos);
    } catch (error: any) {
      console.error('[INSUMO GETALL ERROR]', error?.message);
      res.status(500).json({ error: 'Error al obtener los insumos' });
    }
  }

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const insumo = await insumosService.getById(id);
    if (!insumo) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }
    res.json(insumo);
  }

  async create(req: Request, res: Response) {
    try {
      const nuevo = await insumosService.create(req.body);
      res.status(201).json(nuevo);
    } catch (error: any) {
      if (
        (error.code === "P2002" &&
          error.meta &&
          error.meta.target &&
          error.meta.target.includes("nombre")) ||
        (typeof error.message === "string" &&
          error.message.includes("Unique constraint failed") &&
          error.message.includes("nombre"))
      ) {
        return res
          .status(409)
          .json({ error: "Ya existe un insumo con ese nombre." });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    try {
      const actualizado = await insumosService.update(id, req.body);
      res.json(actualizado);
    } catch (error: any) {
      console.error('[INSUMO UPDATE ERROR]', { id, body: req.body, message: error?.message, code: error?.code, meta: error?.meta });
      if (
        error.code === "P2025" ||
        (typeof error.message === "string" &&
          error.message.includes("No record was found for an update"))
      ) {
        return res
          .status(404)
          .json({ error: "No se encontró el insumo para modificar." });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    try {
      const eliminado = await insumosService.delete(id);
      res.json(eliminado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
