import { Request, Response } from "express";
import { PedidosService } from "../services/pedidos.service";

const service = new PedidosService();

export class PedidosController {
  async list(req: Request, res: Response) {
    try {
      const pagina = Number(req.query.pagina ?? 1);
      const pageSize = Number(req.query.pageSize ?? 10);
      const data = await service.list({ pagina, pageSize });
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async detail(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const data = await service.detail(numPedido);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await service.create(req.body);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async tomar(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const data = await service.tomarPedido(numPedido, req.body);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async finalizar(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const data = await service.finalizarElaboracion(numPedido);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async iniciarElaboracion(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const data = await service.iniciarElaboracion(numPedido);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async finalizarElaboracion(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const data = await service.finalizarElaboracion(numPedido);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async aprobar(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const data = await service.aprobar(numPedido);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async rechazar(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const data = await service.rechazar(numPedido);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async cancelar(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const data = await service.cancelar(numPedido);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
