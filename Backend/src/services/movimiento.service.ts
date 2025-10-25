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

        // Build composable conditions to avoid overwriting parts of `where`
        const and: Prisma.Movimiento_ProductoWhereInput[] = [];

        // Producto: buscar en inventarioOrigen o inventarioDestino
        if (producto) {
            and.push({
                OR: [
                    { inventarioOrigen: { producto: { nombreComercial: { contains: producto, mode: 'insensitive' } } } },
                    { inventarioDestino: { producto: { nombreComercial: { contains: producto, mode: 'insensitive' } } } }
                ]
            });
        }

        // Fecha desde / hasta: aplicable sobre cambiosDeEstado (solo si se provee fechaDesde)
        // Requisito: fechaDesde es necesaria para activar el filtro de fechas; fechaHasta es opcional
        const cambiosDeEstadoSome: any = {};
        if (fechaDesde) {
            // always set lower bound
            cambiosDeEstadoSome.fechaHoraInicio = { gte: new Date(fechaDesde) };
            // optional upper bound
            if (fechaHasta) {
                cambiosDeEstadoSome.fechaHoraInicio.lte = new Date(fechaHasta);
            }
        }

        // Estado actual (idEstado) se interpreta como existencia de un cambio con fechaHoraFin === null
        if (idEstado) {
            cambiosDeEstadoSome.idEstadoMovimiento = idEstado;
            // buscamos el estado actual => fechaHoraFin null
            cambiosDeEstadoSome.fechaHoraFin = null;
        }

        // Sólo añadimos la condición de cambiosDeEstado si tenemos algún criterio válido
        if (Object.keys(cambiosDeEstadoSome).length > 0) {
            and.push({ cambiosDeEstado: { some: cambiosDeEstadoSome } });
        }

        // Depósito: origen o destino
        if (idDeposito) {
            and.push({ OR: [{ idDepositoOrigen: idDeposito }, { idDepositoDestino: idDeposito }] });
        }

        // Final where
        const where: Prisma.Movimiento_ProductoWhereInput = and.length > 0 ? { AND: and } : {};

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
