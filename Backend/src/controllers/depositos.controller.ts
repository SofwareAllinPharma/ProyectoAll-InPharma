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
}
