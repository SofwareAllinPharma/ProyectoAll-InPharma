import { Request, Response } from "express";
import { PedidosService } from "../services/pedidos.service";
import { prisma } from '../lib/prisma';
import type { AuthenticatedRequest } from '../middleware/auth';
import type { RoleCode } from '../utils/roles';

const service = new PedidosService();

function perfilParaOperacion(req: Request, roles: RoleCode[], solicitado: unknown) {
  const perfiles = (req as AuthenticatedRequest).user?.perfiles ?? [];
  const habilitados = perfiles.filter(perfil => perfil.role != null && roles.includes(perfil.role));
  const perfil = habilitados.find(perfil => perfil.idPerfil === Number(solicitado)) ?? habilitados[0];
  if (!perfil) throw new Error('Tu cuenta no tiene un perfil habilitado para esta operación');
  return perfil;
}

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
      if (!userMail) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      let payload = { ...req.body } as any;
      payload.mailUsuarioCreador = userMail;

      const perfil = perfilParaOperacion(req, ['ADMINSIS', 'ADMINFAB'], req.body?.idPerfilCreador);
      payload.idPerfilCreador = perfil.idPerfil;

      const data = await service.create(payload);
      res.status(201).json(data);
    } catch (err: any) {
      console.error('[CREATE PEDIDO ERROR]', err);
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
      const perfil = perfilParaOperacion(req, ['TECNICO', 'ADMINSIS', 'ADMINFAB'], req.body?.idPerfilCocinero);
      const data = await service.tomarPedido(numPedido, {
        mailUsuarioCocinero: userMail!,
        idPerfilCocinero: perfil.idPerfil,
      }, responsable);
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
      const cantidadRealPaquetes = req.body?.cantidadRealPaquetes !== undefined
        ? Number(req.body.cantidadRealPaquetes)
        : undefined;
      const data = await service.finalizarElaboracion(numPedido, responsable, cantidadRealPaquetes);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async finalizarElaboracion(req: Request, res: Response) {
    try {
      const numPedido = Number(req.params.id);
      const cantidadRealPaquetes = req.body?.cantidadRealPaquetes !== undefined
        ? Number(req.body.cantidadRealPaquetes)
        : undefined;
      // Elaborador: puede venir en el body o se obtiene del usuario autenticado como fallback
      let elaborador: string | undefined = req.body?.elaborador?.trim() || undefined;
      if (!elaborador) {
        const userMail = (req as any).user?.mail as string | undefined;
        if (userMail) {
          const p = await prisma.persona.findUnique({ where: { mail: userMail } });
          if (p) elaborador = `${(p.nombre || '').trim()} ${(p.apellido || '').trim()}`.trim();
        }
      }
      const depositador: string | undefined = req.body?.depositador?.trim() || undefined;
      const opts = {
        unidadesPorCaja: req.body?.unidadesPorCaja != null ? Number(req.body.unidadesPorCaja) : undefined,
        idDepositoDestino: req.body?.idDepositoDestino != null ? Number(req.body.idDepositoDestino) : undefined,
        diasVencimientoOverride: req.body?.diasVencimientoOverride != null ? Number(req.body.diasVencimientoOverride) : undefined,
      };
      const data = await service.finalizarElaboracion(numPedido, elaborador, cantidadRealPaquetes, depositador, opts);
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
