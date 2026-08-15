import { Request, Response } from "express";
import { LotesService } from "../services/lotes.service";

const service = new LotesService();

export class IntegracionController {
  // Venta de WooCommerce (vía n8n): descuenta estantería por SKU, idempotente por orderId.
  async ventaWoo(req: Request, res: Response) {
    try {
      const result = await service.procesarVentaWoo({
        orderId: req.body?.orderId,
        items: req.body?.items,
      });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
