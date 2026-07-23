import { Request, Response } from 'express';
import { ProveedoresService } from '../services/proveedores.service';

const service = new ProveedoresService();

export class ProveedoresController {
  async list(_req: Request, res: Response) {
    try {
      res.json(await service.list());
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      res.status(201).json(await service.create(req.body));
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      res.json(await service.update(Number(req.params.id), req.body));
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      await service.remove(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
