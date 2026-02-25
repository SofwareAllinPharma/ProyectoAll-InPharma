import { Request, Response } from "express";
import { FormulasService } from "../services/formulas.service";
import { ROLE_CODES } from "../utils/roles";

const service = new FormulasService();

export class FormulasController {
  async list(req: Request, res: Response) {
    try {
      const { estado, search, insumoId } = req.query;
      const formulas = await service.list({
        estado: estado as string,
        search: search as string,
        insumoId: insumoId ? Number(insumoId) : undefined,
      });
      res.json(formulas);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async detail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const formula = await service.detail(Number(id));
      if (!formula) return res.status(404).json({ error: "No encontrada" });
      res.json(formula);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const dto = req.body;

      const roles = (req as any).roles || [];
      const isAdminSis = roles.includes(ROLE_CODES.ADMINSIS);

      if (dto.esProtegida && !isAdminSis) {
        return res
          .status(403)
          .json({ error: "No tienes permisos para crear una fórmula protegida." });
      }

      const formula = await service.createFormula(dto);
      res.status(201).json(formula);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dto = req.body;

      const roles = (req as any).roles || [];
      const isAdminSis = roles.includes(ROLE_CODES.ADMINSIS);

      if (!isAdminSis) {
        const existing = await service.detail(Number(id));
        if (existing && existing.esProtegida) {
          return res
            .status(403)
            .json({ error: "No tienes permisos para editar una fórmula protegida." });
        }
      }

      const formula = await service.updateFormula(Number(id), dto);
      res.json(formula);
    } catch (err: any) {
      if (err.code === "P2002" && err.meta?.target?.includes("nombre")) {
        return res
          .status(400)
          .json({ error: "Ya existe una fórmula con ese nombre." });
      }
      res.status(400).json({ error: err.message });
    }
  }

  async clone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dto = req.body;
      // El service fuerza esProtegida: false
      const formula = await service.cloneFormula(Number(id), dto);
      res.status(201).json(formula);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const roles = (req as any).roles || [];
      const isAdminSis = roles.includes(ROLE_CODES.ADMINSIS);

      if (!isAdminSis) {
        const existing = await service.detail(Number(id));
        if (existing && existing.esProtegida) {
          return res
            .status(403)
            .json({ error: "No tienes permisos para eliminar una fórmula protegida." });
        }
      }

      await service.softDeleteFormula(Number(id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
