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
            res.status(400).json({ error: err.message });
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

            const { nombreEstado, usuario, observaciones } = req.body as { nombreEstado?: string; usuario?: string; observaciones?: string };
            if (!nombreEstado) return res.status(400).json({ error: 'nombreEstado es requerido' });

            const updated = await service.CambiarEstado(id, nombreEstado, usuario, observaciones);
            res.json(updated);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
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

            const created = await service.registrarMovimiento(payload);
            res.status(201).json(created);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}
