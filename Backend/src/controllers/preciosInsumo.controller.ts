import { Request, Response } from 'express';
import { PreciosInsumoService } from '../services/preciosInsumo.service';

const service = new PreciosInsumoService();

export class PreciosInsumoController {
  async listByInsumo(req: Request, res: Response) {
    try {
      res.json(await service.listByInsumo(Number(req.params.id)));
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async setNuevoPrecio(req: Request, res: Response) {
    try {
      res.status(201).json(await service.setNuevoPrecio(Number(req.params.id), req.body));
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async deletePrecio(req: Request, res: Response) {
    try {
      await service.deletePrecio(Number(req.params.id), Number(req.params.precioId));
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
