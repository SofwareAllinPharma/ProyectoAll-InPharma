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

    const and: Prisma.MovimientoProductoWhereInput[] = [];

        if (producto) {
            and.push({
                OR: [
                    { inventarioOrigen: { producto: { nombreComercial: { contains: producto, mode: 'insensitive' } } } },
                    { inventarioDestino: { producto: { nombreComercial: { contains: producto, mode: 'insensitive' } } } }
                ]
            });
        }

        const cambiosDeEstadoSome: any = {};
        // Normalizar y validar rango de fechas (usar fecha de actualización del movimiento)
        const parseStartOfDay = (s?: string): Date | undefined => {
            if (!s) return undefined;
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
                const [y, m, d] = s.split('-').map(Number);
                return new Date(y, (m as number) - 1, d as number, 0, 0, 0, 0);
            }
            const d = new Date(s);
            return isNaN(d.getTime()) ? undefined : d;
        };
        const parseEndOfDay = (s?: string): Date | undefined => {
            if (!s) return undefined;
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
                const [y, m, d] = s.split('-').map(Number);
                return new Date(y, (m as number) - 1, d as number, 23, 59, 59, 999);
            }
            const d = new Date(s);
            return isNaN(d.getTime()) ? undefined : d;
        };
        const fromDate = parseStartOfDay(fechaDesde);
        const toDate = parseEndOfDay(fechaHasta);
        if (fromDate && toDate && fromDate > toDate) {
            throw new Error('La fecha desde no puede ser posterior a la fecha hasta');
        }
        // Aplicar filtro por rango sobre fecha de actualización del movimiento
        if (fromDate || toDate) {
            const rango: any = {};
            if (fromDate) rango.gte = fromDate;
            if (toDate) rango.lte = toDate;
            and.push({ fechaHoraActualizacion: rango });
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

    const where: Prisma.MovimientoProductoWhereInput = and.length > 0 ? { AND: and } : {};

        const [movimientos, total] = await prisma.$transaction([
            prisma.movimientoProducto.findMany({
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
                // Mostrar primero lo más actualizado
                orderBy: { fechaHoraActualizacion: 'desc' }, 
            }),
            prisma.movimientoProducto.count({ where: where })
        ]);

	
        function formatDateArg(date?: Date | null): string | null {
            if (!date) return null;
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year2 = String(date.getFullYear()).slice(-2);
            return `${day}/${month}/${year2}`;
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
                // En lista devolvemos ISO completo para poder mostrar fecha y hora separadas en el frontend
                fechaHoraActualizacion: mov.fechaHoraActualizacion ? (mov.fechaHoraActualizacion as Date).toISOString() : null,
                producto: productoNombre,
                estado: estadoActual,
                cantidad: cantidad,
                depositoOrigen: depositoOrigen,
                depositoDestino: depositoDestino,
                responsable: mov.responsable || null,
                nombreTipoMovimiento: tipo
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


    async registrarMovimiento(payload: {
        idTipoMovimiento?: number;
        nombreTipoMovimiento?: string;
        idProducto: number;
        cantidad: number;
        idDepositoOrigen: number;
        idDepositoDestino?: number | null;
        responsable?: string;
        observaciones?: string | null;
    }) {
        const {
            idTipoMovimiento,
            nombreTipoMovimiento,
            idProducto,
            cantidad,
            idDepositoOrigen,
            idDepositoDestino,
            responsable,
            observaciones
        } = payload;

        // Validaciones mínimas
        if (!idProducto) throw new Error('Producto es requerido');
        if (!idDepositoOrigen) throw new Error('Depósito origen es requerido');
        if (!Number.isInteger(cantidad) || cantidad <= 0) throw new Error('cantidad debe ser entero y positivo');

        
        let tipoMov: any = null;
        if (idTipoMovimiento) {
            tipoMov = await prisma.tiposMovimiento.findUnique({ where: { idTipoMovimiento } });
        } else if (nombreTipoMovimiento) {
            // Buscar de forma case-insensitive para evitar problemas por diferencias de casing en la BD
            tipoMov = await prisma.tiposMovimiento.findFirst({ where: { nombre: { equals: nombreTipoMovimiento, mode: 'insensitive' } } });
        } else {
            throw new Error('Tipo de movimiento (idTipoMovimiento o nombreTipoMovimiento) es requerido');
        }
        if (!tipoMov) throw new Error('Tipo de movimiento no existe');

        const tipoNombreNorm = (tipoMov.nombre || '').toString().trim().toLowerCase();
        const isTraslado = tipoNombreNorm === 'traslado';
        const isEgreso = tipoNombreNorm === 'egreso';
        if (!isTraslado && !isEgreso) throw new Error('Tipo de movimiento no soportado. Sólo Tipo Movimiento:Egreso|Traslado');

        // Validaciones en depósitos
        const depositoOrigen = await prisma.deposito.findUnique({ where: { id: idDepositoOrigen } });
        if (!depositoOrigen) throw new Error('Depósito origen no encontrado');
        if (!depositoOrigen.estado) throw new Error('Depósito origen no está activo');

        let depositoDestino = null;
        if (isTraslado) {
            if (!idDepositoDestino) throw new Error('Depósito destino es requerido para traslados');
            if (idDepositoDestino === idDepositoOrigen) throw new Error('Depósito origen y destino deben ser distintos');
            depositoDestino = await prisma.deposito.findUnique({ where: { id: idDepositoDestino } });
            if (!depositoDestino) throw new Error('Depósito destino no encontrado');
            if (!depositoDestino.estado) throw new Error('Depósito destino no está activo');
        }

        // Validaciones en inventarios y stock
        const inventarioOrigen = await prisma.inventario.findFirst({ where: { idDeposito: idDepositoOrigen, idProducto } });
        if (!inventarioOrigen) throw new Error('El producto no existe en el depósito origen');  

        if (inventarioOrigen.cantidadProducto < cantidad) {
            throw new Error('El depósito origen no tiene suficiente stock');
        }

        if (isTraslado && depositoDestino) {
            const espacioDisponible = depositoDestino.capacidadTotal - (depositoDestino.capacidadUsada || 0);
            if (espacioDisponible < cantidad) {
                throw new Error('El depósito destino está completo en su capacidad, aumenta capacidad de ese depósito o realiza los movimientos necesarios');
            }
        }

        const now = new Date();

        
    // Buscar el estado 'Creado' de forma case-insensitive para mayor tolerancia con la BD
    const estadoCreado = await prisma.estadoMovimiento.findFirst({ where: { nombre: { equals: 'Creado', mode: 'insensitive' } } });
        if (!estadoCreado) throw new Error('Estado "Creado" no existe en la base de datos, configuración inválida del sistema');

        // Realizamos la transacción para crear el movimiento
        const result = await prisma.$transaction(async (tx) => {
            const mov = await tx.movimientoProducto.create({
                data: {
                    idDepositoOrigen,
                    idProducto,
                    idDepositoDestino: idDepositoDestino ?? null,
                    cantidad,
                    responsable: responsable ?? 'system',
                    observaciones: observaciones ?? null,
                    idTipoMovimiento: tipoMov.idTipoMovimiento
                }
            });

            await tx.cambioEstadoMovimiento.create({
                data: {
                    idEstadoMovimiento: estadoCreado.idEstadoMovimiento,
                    fechaHoraInicio: now,
                    fechaHoraFin: null,
                    idMovimiento: mov.idMovimiento
                }
            });

            // NUEVA LÓGICA (2024-11): Descontar stock del depósito origen al CREAR el movimiento
            // (antes se descontaba al pasar a ENTREGADO). Esto permite reflejar disponibilidad real inmediata.
            // Sólo afecta al origen; el destino (en traslados) se impactará recién en ENTREGADO.
            await tx.inventario.update({
                where: { idDeposito_idProducto: { idDeposito: idDepositoOrigen, idProducto } },
                data: { cantidadProducto: { decrement: cantidad } }
            });

            // Actualizar capacidad usada del depósito origen (libera espacio al salir stock)
            const depOri = await tx.deposito.findUnique({ where: { id: idDepositoOrigen } });
            if (depOri) {
                const nuevaUsadaOri = Math.max(0, (depOri.capacidadUsada || 0) - cantidad);
                if (nuevaUsadaOri !== depOri.capacidadUsada) {
                    await tx.deposito.update({ where: { id: idDepositoOrigen }, data: { capacidadUsada: nuevaUsadaOri } });
                }
            }

            // Marcar timestamp global de stock del producto
            await tx.producto.update({
                where: { idProducto },
                data: ({ lastStockUpdatedAt: now } as any)
            });

            return mov;
        });

        return this.getById(result.idMovimiento);
    }


    async getById(idMovimiento: number) {
        const mov = await prisma.movimientoProducto.findUnique({
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
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year2 = String(date.getFullYear()).slice(-2);
            return `${day}/${month}/${year2}`;
        }
        function formatDateTimeArg(date?: Date | null): string | null {
            if (!date) return null;
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year2 = String(date.getFullYear()).slice(-2);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year2} ${hours}:${minutes}`;
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
            fechaHoraActualizacion: mov.fechaHoraActualizacion ? (mov.fechaHoraActualizacion as Date).toISOString() : null,
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
                fechaHoraInicio: formatDateTimeArg(c.fechaHoraInicio),
                fechaHoraFin: formatDateTimeArg(c.fechaHoraFin),
                responsable: c.responsable ?? null,
                responsableEntrega: (c as any).responsableEntrega ?? null,
                responsableRecepcion: (c as any).responsableRecepcion ?? null,
                observaciones: c.observaciones ?? null
            }))
        };

        return detalle;
    }


    async CambiarEstado(
        idMovimiento: number,
        nombreEstadoDestino: string,
        usuario?: string,
        observaciones?: string,
        responsableEntrega?: string,
        responsableRecepcion?: string
    ) {
        const mov = await prisma.movimientoProducto.findUnique({
            where: { idMovimiento },
            include: {
                cambiosDeEstado: { orderBy: { fechaHoraInicio: 'asc' }, include: { estadoMovimiento: true } },
                tipoMovimiento: true,
            }
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

    const estadoDestino = await prisma.estadoMovimiento.findUnique({ where: { nombre: nombreEstadoDestino } });
        if (!estadoDestino) throw new Error('Estado destino no existe');

        const now = new Date();

        await prisma.$transaction(async (tx) => {
            if (cambioActual && cambioActual.fechaHoraFin === null) {
                await tx.cambioEstadoMovimiento.update({
                    where: { idCambioEstadoMovimiento: cambioActual.idCambioEstadoMovimiento },
                    data: { fechaHoraFin: now }
                });
            }

            // create new cambio (fechaHoraFin stays null)
            const createData: any = {
                idEstadoMovimiento: estadoDestino.idEstadoMovimiento,
                fechaHoraInicio: now,
                fechaHoraFin: null,
                idMovimiento: idMovimiento,
                responsable: usuario ?? null,
                observaciones: typeof observaciones !== 'undefined' ? observaciones : null
            };
            if (destinoNorm === 'entregado') {
                createData.responsableEntrega = responsableEntrega ?? null;
                createData.responsableRecepcion = responsableRecepcion ?? null;
            }
            await tx.cambioEstadoMovimiento.create({ data: createData });

            // Si pasa a ENTREGADO, aplicar impacto en stock y capacidades SOLO del destino (origen ya fue impactado en la creación)
            if (destinoNorm === 'entregado') {
                const cantidad = mov.cantidad;
                const idProducto = mov.idProducto;
                const idDepositoOrigen = mov.idDepositoOrigen;
                const idDepositoDestino = mov.idDepositoDestino ?? null;
                const tipoNombreNorm = (mov.tipoMovimiento?.nombre || '').toString().trim().toLowerCase();
                const isTraslado = tipoNombreNorm === 'traslado';
                const isEgreso = tipoNombreNorm === 'egreso';
                if (isTraslado) {
                    // Validar capacidad destino al momento de entrega (puede haber cambiado desde la creación)
                    if (!idDepositoDestino) throw new Error('Depósito destino faltante en traslado');
                    const depDestino = await tx.deposito.findUnique({ where: { id: idDepositoDestino } });
                    if (!depDestino) throw new Error('Depósito destino no encontrado');
                    const espacioDisponible = (depDestino.capacidadTotal || 0) - (depDestino.capacidadUsada || 0);
                    if (espacioDisponible < cantidad) {
                        // Lanzar un error con prefijo detectible por el frontend
                        throw new Error('CAPACITY_EXCEEDED: El depósito destino no tiene capacidad disponible para completar la entrega');
                    }

                    // Agregar stock al destino
                    const invDest = await tx.inventario.findFirst({ where: { idDeposito: idDepositoDestino, idProducto } });
                    if (invDest) {
                        await tx.inventario.update({
                            where: { idDeposito_idProducto: { idDeposito: idDepositoDestino, idProducto } },
                            data: { cantidadProducto: { increment: cantidad } }
                        });
                    } else {
                        await tx.inventario.create({ data: { idDeposito: idDepositoDestino, idProducto, cantidadProducto: cantidad } });
                    }

                    // Actualizar capacidad usada del destino
                    const nuevaUsadaDes = (depDestino.capacidadUsada || 0) + cantidad;
                    await tx.deposito.update({ where: { id: depDestino.id }, data: { capacidadUsada: nuevaUsadaDes } });
                }

                // Egreso: no hay acción adicional (ya se restó el origen al crear)

                // Actualizar marca de tiempo global de stock para el producto (impacto final del movimiento)
                await tx.producto.update({ where: { idProducto }, data: ({ lastStockUpdatedAt: now } as any) });
            }

            // Actualizar la fecha de última actualización del movimiento
            await tx.movimientoProducto.update({
                where: { idMovimiento },
                data: { fechaHoraActualizacion: now }
            });
        });

        return this.getById(idMovimiento);
    }

    async deleteMovimiento(idMovimiento: number) {
        const mov = await prisma.movimientoProducto.findUnique({
            where: { idMovimiento },
            include: {
                inventarioOrigen: { include: { deposito: true } },
                inventarioDestino: { include: { deposito: true } },
                tipoMovimiento: true,
                cambiosDeEstado: { include: { estadoMovimiento: true } },
            }
        });
        if (!mov) throw new Error('Movimiento no encontrado');

        // Determinar estado actual
        const cambioActual = (mov.cambiosDeEstado || []).find(c => c.fechaHoraFin === null) ?? (mov.cambiosDeEstado || [])[mov.cambiosDeEstado.length - 1];
        const nombreActual = cambioActual?.estadoMovimiento?.nombre ?? null;
        const actualNorm = (nombreActual || '').toString().trim().toLowerCase().replace(/\s+/g, '');

        await prisma.$transaction(async (tx) => {
            const cantidad = mov.cantidad;
            const idProducto = mov.idProducto;
            const idDepositoOrigen = mov.idDepositoOrigen;
            const idDepositoDestino = mov.idDepositoDestino ?? null;
            const isTraslado = (mov.tipoMovimiento?.nombre || '').toString().trim().toLowerCase() === 'traslado';

            // Revertir SIEMPRE el impacto en el origen (el origen se descuenta al crear ahora)
            await tx.inventario.update({
                where: { idDeposito_idProducto: { idDeposito: idDepositoOrigen, idProducto } },
                data: { cantidadProducto: { increment: cantidad } }
            });
            const depOri = await tx.deposito.findUnique({ where: { id: idDepositoOrigen } });
            if (depOri) {
                await tx.deposito.update({
                    where: { id: idDepositoOrigen },
                    data: { capacidadUsada: (depOri.capacidadUsada || 0) + cantidad }
                });
            }

            // Si estaba ENTREGADO y era traslado, revertir también el destino
            if (actualNorm === 'entregado' && isTraslado && idDepositoDestino) {
                const invDestino = await tx.inventario.findFirst({ where: { idDeposito: idDepositoDestino, idProducto } });
                if (invDestino) {
                    const nuevaCant = Math.max(0, (invDestino.cantidadProducto || 0) - cantidad);
                    await tx.inventario.update({
                        where: { idDeposito_idProducto: { idDeposito: idDepositoDestino, idProducto } },
                        data: { cantidadProducto: nuevaCant }
                    });
                }
                const depDes = await tx.deposito.findUnique({ where: { id: idDepositoDestino } });
                if (depDes) {
                    const nuevaCap = Math.max(0, (depDes.capacidadUsada || 0) - cantidad);
                    await tx.deposito.update({ where: { id: idDepositoDestino }, data: { capacidadUsada: nuevaCap } });
                }
            }

            // Timestamp global de stock
            await tx.producto.update({ where: { idProducto }, data: ({ lastStockUpdatedAt: new Date() } as any) });

            // eliminar cambios y luego el movimiento
            await tx.cambioEstadoMovimiento.deleteMany({ where: { idMovimiento } });
            await tx.movimientoProducto.delete({ where: { idMovimiento } });
        });

        return { ok: true };
    }

}
