import { Request, Response } from "express";
import { PedidosService } from "../services/pedidos.service";
import { prisma } from '../lib/prisma';

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
      // Intentar obtener mail del usuario autenticado
      const userMail = (req as any).user?.mail as string | undefined;
      let payload = { ...req.body } as any;
      if (userMail) {
        payload.mailUsuarioCreador = userMail;
        // Si no viene idPerfilCreador, tratar de resolver el primer perfil asignado al usuario
        if (!payload.idPerfilCreador) {
          const up = await prisma.usuarioPerfil.findFirst({ where: { mail: userMail } });
          if (up) payload.idPerfilCreador = up.idPerfil;
        }
      }

      const data = await service.create(payload);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async tomar(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      // Determinar responsable a partir del usuario logueado (persona asociada)
      const userMail = (req as any).user?.mail as string | undefined;
      let responsable: string | undefined = undefined;
      if (userMail) {
        const p = await prisma.persona.findUnique({ where: { mail: userMail } });
        if (p) responsable = `${(p.nombre || '').trim()} ${(p.apellido || '').trim()}`.trim();
      }
      const data = await service.tomarPedido(numPedido, req.body, responsable);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async finalizar(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const userMail = (req as any).user?.mail as string | undefined;
      let responsable: string | undefined = undefined;
      if (userMail) {
        const p = await prisma.persona.findUnique({ where: { mail: userMail } });
        if (p) responsable = `${(p.nombre || '').trim()} ${(p.apellido || '').trim()}`.trim();
      }
      const data = await service.finalizarElaboracion(numPedido, responsable);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async finalizarElaboracion(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const userMail = (req as any).user?.mail as string | undefined;
      let responsable: string | undefined = undefined;
      if (userMail) {
        const p = await prisma.persona.findUnique({ where: { mail: userMail } });
        if (p) responsable = `${(p.nombre || '').trim()} ${(p.apellido || '').trim()}`.trim();
      }
      const data = await service.finalizarElaboracion(numPedido, responsable);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async cancelar(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const userMail = (req as any).user?.mail as string | undefined;
      let responsable: string | undefined = undefined;
      if (userMail) {
        const p = await prisma.persona.findUnique({ where: { mail: userMail } });
        if (p) responsable = `${(p.nombre || '').trim()} ${(p.apellido || '').trim()}`.trim();
      }
      const data = await service.cancelar(numPedido, responsable);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
