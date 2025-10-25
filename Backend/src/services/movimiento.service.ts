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

        const and: Prisma.Movimiento_ProductoWhereInput[] = [];

        if (producto) {
            and.push({
                OR: [
                    { inventarioOrigen: { producto: { nombreComercial: { contains: producto, mode: 'insensitive' } } } },
                    { inventarioDestino: { producto: { nombreComercial: { contains: producto, mode: 'insensitive' } } } }
                ]
            });
        }

        const cambiosDeEstadoSome: any = {};
        if (fechaDesde) {
            cambiosDeEstadoSome.fechaHoraInicio = { gte: new Date(fechaDesde) };
            if (fechaHasta) {
                cambiosDeEstadoSome.fechaHoraInicio.lte = new Date(fechaHasta);
            }
        }
        if (idEstado) {
            cambiosDeEstadoSome.idEstadoMovimiento = idEstado;
            cambiosDeEstadoSome.fechaHoraFin = null;
        }

        if (Object.keys(cambiosDeEstadoSome).length > 0) {
            and.push({ cambiosDeEstado: { some: cambiosDeEstadoSome } });
        }

        if (idDeposito) {
            and.push({ OR: [{ idDepositoOrigen: idDeposito }, { idDepositoDestino: idDeposito }] });
        }

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


    async getById(idMovimiento: number) {
        const mov = await prisma.movimiento_Producto.findUnique({
            where: { idMovimiento },
            include: {
                tipoMovimiento: true,
                cambiosDeEstado: {
                    orderBy: { fechaHoraInicio: 'asc' },
                    include: { estadoMovimiento: true }
                },
                inventarioOrigen: { include: { deposito: true, producto: true } },
                inventarioDestino: { include: { deposito: true, producto: true } },
            }
        });

        if (!mov) throw new Error('Movimiento no encontrado');

        function formatDateArg(date?: Date | null): string | null {
            if (!date) return null;
            const day = String(date.getUTCDate()).padStart(2, '0');
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const year = String(date.getUTCFullYear());
            const hour = String(date.getUTCHours()).padStart(2, '0');
            const minute = String(date.getUTCMinutes()).padStart(2, '0');
            return `${day}-${month}-${year}-${hour}:${minute}`;
        }

        const CREATED_STATE_ID = 1;
        const cambioCreado = mov.cambiosDeEstado.find(c => c.idEstadoMovimiento === CREATED_STATE_ID);
        const fechaCreacionRaw = cambioCreado?.fechaHoraFin ?? cambioCreado?.fechaHoraInicio ?? mov.cambiosDeEstado[0]?.fechaHoraInicio ?? null;
        const fechaCreacion = formatDateArg(fechaCreacionRaw as Date | null);

        const estadoActual = mov.cambiosDeEstado.find(c => c.fechaHoraFin === null)
            ?.estadoMovimiento.nombre || 'Indefinido';

        const producto = mov.inventarioOrigen?.producto ?? mov.inventarioDestino?.producto ?? null;

        const detalle = {
            idMovimiento: mov.idMovimiento,
            fechaCreacion,
            fechaHoraActualizacion: formatDateArg(mov.fechaHoraActualizacion),
            responsable: mov.responsable,
            producto: producto ? {
                idProducto: producto.idProducto,
                idFormula: producto.idFormula,
                nombreComercial: producto.nombreComercial,
                pesoNeto: producto.pesoNeto,
                cantPorcionesAportadas: producto.cantPorcionesAportadas,
                estaActivo: producto.estaActivo
            } : null,
            estado: estadoActual,
            cantidad: mov.cantidad,
            depositoOrigen: mov.inventarioOrigen?.deposito ? {
                id: mov.inventarioOrigen.deposito.id,
                nombre: mov.inventarioOrigen.deposito.nombre
            } : { id: mov.idDepositoOrigen },
            depositoDestino: mov.inventarioDestino?.deposito ? {
                id: mov.inventarioDestino.deposito.id,
                nombre: mov.inventarioDestino.deposito.nombre
            } : (mov.idDepositoDestino ? { id: mov.idDepositoDestino } : null),
            tipoMovimiento: mov.tipoMovimiento ? { idTipoMovimiento: mov.tipoMovimiento.idTipoMovimiento, nombre: mov.tipoMovimiento.nombre } : null,
            observaciones: mov.observaciones || null,
            cambiosDeEstado: mov.cambiosDeEstado.map(c => ({
                idCambioEstadoMovimiento: c.idCambioEstadoMovimiento,
                idEstadoMovimiento: c.idEstadoMovimiento,
                nombreEstado: c.estadoMovimiento?.nombre || null,
                fechaHoraInicio: formatDateArg(c.fechaHoraInicio),
                fechaHoraFin: formatDateArg(c.fechaHoraFin)
            }))
        };

        return detalle;
    }


    async CambiarEstado(idMovimiento: number, nombreEstadoDestino: string, usuario?: string) {
        const mov = await prisma.movimiento_Producto.findUnique({
            where: { idMovimiento },
            include: { cambiosDeEstado: { orderBy: { fechaHoraInicio: 'asc' }, include: { estadoMovimiento: true } } }
        });

        if (!mov) throw new Error('Movimiento no encontrado');

        const cambios = mov.cambiosDeEstado || [];
        const cambioActual = cambios.find(c => c.fechaHoraFin === null) ?? cambios[cambios.length - 1];
        const nombreActual = cambioActual?.estadoMovimiento?.nombre ?? null;

        const normalize = (s?: string | null) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '');
        const actualNorm = normalize(nombreActual);
        const destinoNorm = normalize(nombreEstadoDestino);

        if (['cancelado', 'entregado'].includes(actualNorm)) {
            throw new Error('Estado final, no puede modificarse');
        }

        const allowedFrom: Record<string, string[]> = {
            encamino: ['cancelado', 'entregado'],
            creado: ['cancelado', 'encamino']
        };

        const allowed = allowedFrom[actualNorm] ?? [];
        if (!allowed.includes(destinoNorm)) {
            throw new Error(`Transición no permitida desde '${nombreActual ?? 'indefinido'}' a '${nombreEstadoDestino}'`);
        }

        const estadoDestino = await prisma.estado_Movimiento.findUnique({ where: { nombre: nombreEstadoDestino } });
        if (!estadoDestino) throw new Error('Estado destino no existe');

        const now = new Date();

        await prisma.$transaction(async (tx) => {
            if (cambioActual && cambioActual.fechaHoraFin === null) {
                await tx.cambio_Estado_Movimiento.update({
                    where: { idCambioEstadoMovimiento: cambioActual.idCambioEstadoMovimiento },
                    data: { fechaHoraFin: now }
                });
            }

            // create new cambio (fechaHoraFin stays null)
            await tx.cambio_Estado_Movimiento.create({
                data: {
                    idEstadoMovimiento: estadoDestino.idEstadoMovimiento,
                    fechaHoraInicio: now,
                    fechaHoraFin: null,
                    idMovimiento: idMovimiento
                }
            });
        });

        return this.getById(idMovimiento);
    }
}
