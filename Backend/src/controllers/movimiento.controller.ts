import { Request, Response } from "express";
import { MovimientoService } from "../services/movimiento.service";

const service = new MovimientoService();

export class MovimientoController {
    async getAllMovimientos(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const {
                idEstado,
                idDeposito,
                producto,
                fechaDesde,
                fechaHasta
            } = req.query;

            const options = {
                page,
                limit,

                idEstado: idEstado ? parseInt(idEstado as string) : undefined,
                idDeposito: idDeposito ? parseInt(idDeposito as string) : undefined,

                producto: producto as string | undefined,
                fechaDesde: fechaDesde as string | undefined,
                fechaHasta: fechaHasta as string | undefined,
            };

            const paginatedResult = await service.getAll(options);
            res.json(paginatedResult);

        } catch (err: any) {
            const msg = err?.message || String(err || 'Error');
            // Detectar error de capacidad y devolver código y status específico
            if (/CAPACITY_EXCEEDED|capacit|capacidad|sobrepas/i.test(msg)) {
                const clean = msg.replace(/^CAPACITY_EXCEEDED:\s*/i, '').trim();
                return res.status(409).json({ error: clean, code: 'CAPACITY_EXCEEDED' });
            }
            res.status(400).json({ error: msg });
        }
    }


    async getMovimientoById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) return res.status(400).json({ error: 'Id inválido' });

            const detalle = await service.getById(id);
            res.json(detalle);
        } catch (err: any) {
            res.status(404).json({ error: err.message });
        }

    }
    
    async CambiarEstado(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) return res.status(400).json({ error: 'Id inválido' });

            const { nombreEstado, usuario, observaciones, responsableEntrega, responsableRecepcion } = req.body as {
                nombreEstado?: string;
                usuario?: string;
                observaciones?: string;
                responsableEntrega?: string;
                responsableRecepcion?: string;
            };
            if (!nombreEstado) return res.status(400).json({ error: 'nombreEstado es requerido' });

            // Si es Entregado, validar ambos responsables
            const norm = (nombreEstado || '').toString().trim().toLowerCase().replace(/\s+/g, '');
            if (norm === 'entregado') {
                if (!responsableEntrega || !responsableEntrega.trim() || !responsableRecepcion || !responsableRecepcion.trim()) {
                    return res.status(400).json({ error: 'Para marcar como Entregado, responsableEntrega y responsableRecepcion son requeridos' });
                }
            }

            const updated = await service.CambiarEstado(id, nombreEstado, usuario, observaciones, responsableEntrega, responsableRecepcion);
            res.json(updated);
        } catch (err: any) {
            const msg = err?.message || String(err || 'Error');
            // MODIFICACIÓN: Manejar error de capacidad para el cambio de estado.
            if (/CAPACITY_EXCEEDED|capacit|capacidad|sobrepas/i.test(msg)) {
                // Devolver 409 Conflict si hay un problema de capacidad
                const clean = msg.replace(/^CAPACITY_EXCEEDED:\s*/i, '').trim();
                return res.status(409).json({ error: clean, code: 'CAPACITY_EXCEEDED' });
            }
            res.status(400).json({ error: msg });
        }
    }

    async crearMovimiento(req: Request, res: Response) {
        try {
            const payload = req.body as {
                idTipoMovimiento?: number;
                nombreTipoMovimiento?: string;
                idProducto: number;
                cantidad: number;
                idDepositoOrigen: number;
                idDepositoDestino?: number | null;
                responsable?: string;
                observaciones?: string | null;
            };

            const userMail = (req as any).user?.mail as string | undefined;
            const created = await service.registrarMovimiento(payload, userMail);
            res.status(201).json(created);
        } catch (err: any) {
            const msg = err?.message || String(err || 'Error');
            // MODIFICACIÓN: Manejar error de capacidad para la creación de movimiento.
            if (/CAPACITY_EXCEEDED|capacit|capacidad|sobrepas/i.test(msg)) {
                const clean = msg.replace(/^CAPACITY_EXCEEDED:\s*/i, '').trim();
                return res.status(409).json({ error: clean, code: 'CAPACITY_EXCEEDED' });
            }
            res.status(400).json({ error: msg });
        }
    }

    async eliminarMovimiento(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) return res.status(400).json({ error: 'Id inválido' });
            const result = await service.deleteMovimiento(id);
            res.json(result);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}