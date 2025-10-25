
import { prisma } from "../lib/prisma";

export class MovimientoService {
	async getAll() {
		return prisma.movimiento_Producto.findMany({
			include: {
				tipoMovimiento: true,
				cambiosDeEstado: {
					orderBy: { fechaHoraInicio: 'asc' },
				},
				inventarioOrigen: {
					include: { deposito: true, producto: true },
				},
				inventarioDestino: {
					include: { deposito: true, producto: true },
				},
			},
			orderBy: { fechaHoraActualizacion: 'desc' },
		});
	}
}
