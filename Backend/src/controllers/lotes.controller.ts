import { Request, Response } from "express";
import { LotesService } from "../services/lotes.service";

const service = new LotesService();

export class LotesController {
  async list(req: Request, res: Response) {
    try {
      const { idProducto } = req.query;
      const lotes = await service.list({
        idProducto: idProducto ? Number(idProducto) : undefined,
      });
      res.json(lotes);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async detail(req: Request, res: Response) {
    try {
      const lote = await service.detail(Number(req.params.id));
      if (!lote) return res.status(404).json({ error: "Lote no encontrado" });
      res.json(lote);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const lote = await service.crear(req.body);
      res.status(201).json(lote);
    } catch (err: any) {
      if (err.code === "P2002" && err.meta?.target?.includes("numeroLote")) {
        return res.status(400).json({ error: "Ya existe un lote con ese número." });
      }
      res.status(400).json({ error: err.message });
    }
  }

  async stockPorDeposito(req: Request, res: Response) {
    try {
      const stock = await service.stockPorDeposito(Number(req.params.idDeposito));
      res.json(stock);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async trasladar(req: Request, res: Response) {
    try {
      const result = await service.trasladar({
        idDepositoOrigen: Number(req.body?.idDepositoOrigen),
        idDepositoDestino: Number(req.body?.idDepositoDestino),
        idProducto: Number(req.body?.idProducto),
        cantidadCajas: Number(req.body?.cantidadCajas),
        responsableEnvio: req.body?.responsableEnvio,
        responsableRecepcion: req.body?.responsableRecepcion,
      });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
