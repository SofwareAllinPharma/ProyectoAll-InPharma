import { Request, Response } from "express";
import { ProductosService } from "../services/productos.service";

const service = new ProductosService();

export class ProductosController {
  async list(req: Request, res: Response) {
    try {
      const { search, formula, insumo } = req.query;
      const productos = await service.list({
        search: search as string,
        formula: formula as string,
        insumo: insumo as string,
      });
      res.json(productos);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async detail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const producto = await service.detail(Number(id));
      if (!producto) return res.status(404).json({ error: "No encontrado" });
      res.json(producto);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const dto = req.body;
      const producto = await service.createProducto(dto);
      res.status(201).json(producto);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dto = req.body;
      const producto = await service.updateProducto(Number(id), dto);
      res.json(producto);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await service.softDeleteProducto(Number(id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async costo(req: Request, res: Response) {
    try {
      res.json(await service.calcularCosto(Number(req.params.id)));
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
