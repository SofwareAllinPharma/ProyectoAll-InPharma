import { Request, Response } from 'express';
import { InventarioGlobalService } from '../services/inventarioGlobal.service';

export const InventarioGlobalController = {
  // GET /inventario-global
  async list(req: Request, res: Response) {
    try {
      const { q, sort, order } = req.query as any;
      const data = await InventarioGlobalService.listGlobal({ q, sort, order });
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message ?? 'Error interno' });
    }
  },

  // GET /inventario-global/resumen-estados
  async resumen(req: Request, res: Response) {
    try {
      const data = await InventarioGlobalService.resumenEstadosGlobal();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message ?? 'Error interno' });
    }
  },
};
