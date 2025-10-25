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


}