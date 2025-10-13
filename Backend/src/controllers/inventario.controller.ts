import { Request, Response } from 'express';
import { InventarioService } from '../services/inventario.service';

function parseId(n: any, name: string) {
  const v = Number(n);
  if (!Number.isInteger(v) || v <= 0) throw Object.assign(new Error(`${name} inválido`), { status: 400 });
  return v;
}

 
export const InventarioController = {  
  
  // PUT /inventario/:idDeposito/umbrales  (bulk: { items: [{idProducto, umbralMin}, ...] })
  async bulkUpsertUmbralMin(req: Request, res: Response) {
    try {
      const idDeposito = parseId(req.params.idDeposito, 'idDeposito');
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      if (!items.length) return res.status(400).json({ message: 'items vacío' });

      const updated = await InventarioService.bulkUpsertUmbralMin(idDeposito, items);
      return res.json(updated);
    } catch (e: any) {
      return res.status(400).json({ message: e.message ?? 'Datos inválidos' });
    }
  },


  // GET /inventario/:idDeposito
  async listInventarioByDeposito(req: Request, res: Response) {
    try {
      const idDeposito = parseId(req.params.idDeposito, 'idDeposito');
      const data = await InventarioService.listInventarioByDeposito(idDeposito);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message ?? 'Error interno' });
    }
  },

  // GET /inventario/:idDeposito/umbrales-config
  async listProductosConUmbral(req: Request, res: Response) {
    try {
      const idDeposito = parseId(req.params.idDeposito, 'idDeposito');
      const data = await InventarioService.listProductosConUmbral(idDeposito);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message ?? 'Error interno' });
    }
  },

  // GET /inventario/:idDeposito/resumen-estados
  async resumenEstados(req: Request, res: Response) {
    try {
      const idDeposito = parseId(req.params.idDeposito, 'idDeposito');
      const data = await InventarioService.resumenEstados(idDeposito);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message ?? 'Error interno' });
    }
  },
};
