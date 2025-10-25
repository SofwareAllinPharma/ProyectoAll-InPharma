import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

type GetAllMovimientosOptions = {
  page: number;
  limit: number;
  idEstado?: number;
  idDeposito?: number;
  producto?: string;
  fechaDesde?: string;
  fechaHasta?: string;
};

export class MovimientoService {
	async getAll(options: GetAllMovimientosOptions) {
        const { page, limit, idEstado, idDeposito, producto, fechaDesde, fechaHasta } = options;
        
        const skip = (page - 1) * limit;

    const where: Prisma.Movimiento_ProductoWhereInput = {};

        if (producto) {
            where.inventarioOrigen = {
                producto: {
                    nombreComercial: { contains: producto, mode: 'insensitive' }
                }
            };
        }

        if (fechaDesde || fechaHasta) {
            where.cambiosDeEstado = {
                some: {
                    fechaHoraInicio: {
                        gte: fechaDesde ? new Date(fechaDesde) : undefined,
                        lte: fechaHasta ? new Date(fechaHasta) : undefined,
                    },
                }
            };
        }

        if (idEstado) {
            where.cambiosDeEstado = {
                ...where.cambiosDeEstado,
                some: {
                    ... (where.cambiosDeEstado as any)?.some,
                    idEstadoMovimiento: idEstado,
                    fechaHoraFin: null 
                }
            };
        }

        if (idDeposito) {
            where.OR = [
                { idDepositoOrigen: idDeposito },
                { idDepositoDestino: idDeposito }
            ];
        }

        const [movimientos, total] = await prisma.$transaction([
            prisma.movimiento_Producto.findMany({
                skip: skip,
                take: limit,
                where: where,
                include: {
                    tipoMovimiento: true, 
                    cambiosDeEstado: {
                        orderBy: { fechaHoraInicio: 'asc' }, 
                        include: { estadoMovimiento: true }
                    },
                    inventarioOrigen: {
                        include: { deposito: true, producto: true },
                    },
                    inventarioDestino: {
                        include: { deposito: true, producto: true },
                    },
                },
                orderBy: { idMovimiento: 'desc' }, 
            }),
            prisma.movimiento_Producto.count({ where: where })
        ]);

	
        function formatDateArg(date?: Date | null): string | null {
            if (!date) return null;
            const day = String(date.getUTCDate()).padStart(2, '0');
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const year = String(date.getUTCFullYear());
            const hour = String(date.getUTCHours()).padStart(2, '0');
            const minute = String(date.getUTCMinutes()).padStart(2, '0');
            return `${day}-${month}-${year}-${hour}:${minute}`;
        }

        const dataFormateada = movimientos.map(mov => {
            
            
            const CREATED_STATE_ID = 1;
            const cambioCreado = mov.cambiosDeEstado.find(c => c.idEstadoMovimiento === CREATED_STATE_ID);
            const fechaCreacionRaw = cambioCreado?.fechaHoraFin ?? cambioCreado?.fechaHoraInicio ?? mov.cambiosDeEstado[0]?.fechaHoraInicio ?? null;
            const fechaCreacion = formatDateArg(fechaCreacionRaw as Date | null);
            
            const estadoActual = mov.cambiosDeEstado.find(c => c.fechaHoraFin === null)
                ?.estadoMovimiento.nombre || 'Indefinido';
            
            const productoNombre = mov.inventarioOrigen.producto.nombreComercial; 
            const tipo = mov.tipoMovimiento.nombre;
            const cantidad = mov.cantidad;
            const depositoOrigen = mov.inventarioOrigen?.deposito?.nombre || null;
            const depositoDestino = mov.inventarioDestino?.deposito?.nombre || null;

            return {
                idMovimiento: mov.idMovimiento,
                fechaCreacion: fechaCreacion,
                producto: productoNombre,
                estado: estadoActual,
                cantidad: cantidad,
                depositoOrigen: depositoOrigen,
                depositoDestino: depositoDestino
            };
        });

        
        return {
            data: dataFormateada,
            meta: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                itemsPerPage: limit
            }
        };
    }
}
