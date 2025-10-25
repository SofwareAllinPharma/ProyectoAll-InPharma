import { Request, Response } from "express";
import { MovimientoService } from "../services/movimiento.service";

const service = new MovimientoService();

export class MovimientoController {
	async getAllMovimientos(req: Request, res: Response) {
		try {
			const movimientos = await service.getAll();
			res.json(movimientos);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}

}