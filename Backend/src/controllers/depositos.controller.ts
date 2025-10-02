import { Request, Response } from "express";
import { DepositosService } from "../services/depositos.service";

const depositosService = new DepositosService();


export class DepositosController {
    /**POST /depositos */
  async create(req: Request, res: Response) {
    try {
      const { nombre, direccion, responsable, capacidadTotal } = req.body ?? {};

      if (
        !nombre ||
        !direccion ||
        !responsable ||
        capacidadTotal === undefined ||
        capacidadTotal === null
      ) {
        return res.status(400).json({ error: "Faltan campos requeridos." });
      }
    if (Number.isNaN(Number(capacidadTotal))) {
      return res
        .status(400)
        .json({ error: "capacidadTotal debe ser un número." });
    }
    if (Number(capacidadTotal) <= 0) {
      return res
        .status(400)
        .json({ error: "capacidadTotal debe ser un número positivo." });
    }

      const nuevo = await depositosService.create({
        nombre: String(nombre).trim(),
        direccion: String(direccion).trim(),
        responsable: String(responsable).trim(),
        capacidadTotal: Number(capacidadTotal),
      });

      return res.status(201).json(nuevo);
    } catch (error: any) {
      const isUniqueNombre =
        (error?.code === "P2002" &&
          Array.isArray(error?.meta?.target) &&
          error.meta.target.includes("nombre")) ||
        (typeof error?.message === "string" &&
          error.message.includes("Unique constraint failed") &&
          error.message.includes("nombre"));

      if (isUniqueNombre) {
        return res
          .status(409)
          .json({ error: "Ya existe un depósito con ese nombre." });
      }

      return res
        .status(400)
        .json({ error: error?.message ?? "Error al crear depósito" });
    }
  }
  /**GET /depositos */
  async getAll(req: Request, res: Response) {
    try {
      const depositos = await depositosService.findAll();
      return res.json(depositos);
    } catch (error: any) {
      return res.status(500).json({ error: "Error al obtener depósitos." });
    }
  }
  /**GET /depositos por id */
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: "ID inválido." });
      }

      const deposito = await depositosService.findById(id);
      if (!deposito) {
        return res.status(404).json({ error: "Depósito no encontrado." });
      }

      return res.json(deposito);
    } catch (error: any) {
      return res.status(500).json({ error: "Error al obtener depósito." });
    }
  }
  // PUT /depositos/:id
   async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido." });

      const { responsable, capacidadTotal } = req.body ?? {};
      if (responsable === undefined && capacidadTotal === undefined) {
        return res.status(400).json({ error: "No hay campos válidos para actualizar (solo responsable o capacidadTotal)." });
      }

      const actualizado = await depositosService.update(id, {
        responsable: responsable ? String(responsable).trim() : undefined,
        capacidadTotal: capacidadTotal !== undefined ? Number(capacidadTotal) : undefined,
      });

      return res.json(actualizado);
    } catch (error: any) {
      if (error?.code === "P2025") return res.status(404).json({ error: "Depósito no encontrado." });
      return res.status(400).json({ error: error?.message ?? "Error al modificar depósito" });
    }
  }
  // DELETE /depositos/:id  (baja lógica)
  async deactivate(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido." });

      const inactivado = await depositosService.deactivate(id);
      return res.json({
        message: "Depósito desactivado con éxito.",
        deposito: inactivado,
      });
    } catch (error: any) {
      if (error?.code === "P2025") return res.status(404).json({ error: "Depósito no encontrado." });
      return res.status(400).json({ error: error?.message ?? "Error al eliminar depósito" });
    }
  }
}
