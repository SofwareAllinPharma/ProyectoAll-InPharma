import { prisma } from "../lib/prisma";
import { PedidosRepository } from "../repositories/pedidos.repository";
import { LotesService } from "./lotes.service";
import { slugProducto, calcularVencimiento } from "../utils/lote";
import { z } from 'zod';

const productoRegistradoSchema = z.object({
  idProducto: z.number().int().positive(),
  nombreComercial: z.string().min(1),
  pesoNeto: z.number().finite().positive(),
  cantPorcionesAportadas: z.number().finite().positive(),
  diasVencimiento: z.number().int().nullable(),
  formula: z.object({ porcion: z.number().finite().positive() }),
});

const ESTADOS = {
  CREADO: "Creado",
  EN_ELAB: "EnElaboración",
  ELAB_FAB: "ElaboradoYDepositadoEnFábrica",
  CANCELADO: "Cancelado",
} as const;

function round4(n: number) {
  return Math.round(n * 10000) / 10000;
}

export class PedidosService {
  repo = new PedidosRepository();
  private lotesService = new LotesService();

  async list({
    pagina = 1,
    pageSize = 10,
  }: {
    pagina?: number;
    pageSize?: number;
  }) {
    return this.repo.list(pagina, pageSize);
  }

  async detail(numPedido: number) {
    const p = await this.repo.findById(numPedido);
    if (!p) throw new Error("Pedido no encontrado");
    return p;
  }

  private async getEstadoId(nombre: string) {
    const estado = await prisma.estadoPedido.findFirst({ where: { nombre } });
    if (!estado) throw new Error(`EstadoPedido "${nombre}" no existe`);
    return estado.id;
  }

  private convertirCantidades(
    {
      gramos,
      paquetes,
      porciones,
    }: { gramos?: number; paquetes?: number; porciones?: number },
    producto: any
  ) {
    const pesoPaquete = Number(producto.pesoNeto);
    const porcion = Number(producto.formula?.porcion);
    if (![pesoPaquete, porcion].every(v => Number.isFinite(v) && v > 0))
      throw new Error("Producto o fórmula inválidos para conversión");

    if ([gramos, paquetes, porciones].some(v => v !== undefined && (!Number.isFinite(v) || v <= 0))) throw new Error("Las cantidades deben ser finitas y mayores a 0");

    let g = gramos,
      pqt = paquetes,
      por = porciones;

    const hasG = typeof g === "number" && g > 0;
    const hasPqt = typeof pqt === "number" && pqt > 0;
    const hasPor = typeof por === "number" && por > 0;

    if (!hasG && !hasPqt && !hasPor)
      throw new Error("Debe indicar gramos, paquetes o porciones (> 0)");

    if (hasG) {
      pqt = round4(g! / pesoPaquete);
      por = round4(g! / porcion);
    } else if (hasPqt) {
      g = round4(pqt! * pesoPaquete);
      por = round4(g / porcion);
    } else if (hasPor) {
      g = round4(por! * porcion);
      pqt = round4(g / pesoPaquete);
    }

    if (![g, pqt, por].every(v => typeof v === "number" && Number.isFinite(v) && v > 0))
      throw new Error("Las cantidades convertidas deben ser > 0");

    return {
      cantAProducir_gramos: g!,
      cantAProducir_paquetes: pqt!,
      cantAProducir_porciones: por!,
    };
  }

  async create(dto: {
    idProducto: number;
    gramos?: number;
    paquetes?: number;
    porciones?: number;
    observacion?: string;
    mailUsuarioCreador: string;
    idPerfilCreador: number;
  }) {
    if (!dto.idProducto) throw new Error("idProducto es obligatorio");
    if (!dto.mailUsuarioCreador || !dto.idPerfilCreador)
      throw new Error("Datos del creador obligatorios");

    const producto = await prisma.producto.findUnique({
      where: { idProducto: dto.idProducto },
      include: { formula: true },
    });
    if (!producto || !producto.estaActivo)
      throw new Error("Producto no disponible");

    // Verificar que el creador exista con ese perfil (FK compuesta)
    const creador = await prisma.usuarioPerfil.findUnique({
      where: {
        mail_idPerfil: {
          mail: dto.mailUsuarioCreador,
          idPerfil: dto.idPerfilCreador,
        },
      },
    });
    if (!creador)
      throw new Error(
        "El usuario creador no existe o no tiene asignado ese perfil"
      );

    const cantidades = this.convertirCantidades(
      { gramos: dto.gramos, paquetes: dto.paquetes, porciones: dto.porciones },
      producto
    );

    const estadoCreadoId = await this.getEstadoId(ESTADOS.CREADO);

    const dataPedido = {
      idProducto: dto.idProducto,
      ...cantidades,
      observacion: dto.observacion ?? null,
      mailUsuarioCreador: dto.mailUsuarioCreador,
      idPerfilCreador: dto.idPerfilCreador,
      estaAsignado: false,
    };

    return this.repo.createWithEstadoCreado(dataPedido, estadoCreadoId, producto);
  }

  async tomarPedido(
    numPedido: number,
    dto: { mailUsuarioCocinero: string; idPerfilCocinero: number },
    responsable?: string
  ) {
    if (!dto.mailUsuarioCocinero || !dto.idPerfilCocinero)
      throw new Error("Datos del cocinero obligatorios");

    const pedido = await this.detail(numPedido);
    if (pedido.estaAsignado) throw new Error("El pedido ya está asignado");
    if (pedido.cambioActual?.estado?.nombre !== ESTADOS.CREADO)
      throw new Error("Solo pedidos en estado Creado pueden tomarse");

    // Verificar que el cocinero exista con ese perfil (FK compuesta)
    const cocinero = await prisma.usuarioPerfil.findUnique({
      where: {
        mail_idPerfil: {
          mail: dto.mailUsuarioCocinero,
          idPerfil: dto.idPerfilCocinero,
        },
      },
    });
    if (!cocinero)
      throw new Error(
        "El usuario cocinero no existe o no tiene asignado ese perfil"
      );

    const estadoEnElabId = await this.getEstadoId(ESTADOS.EN_ELAB);

    return this.repo.transition(numPedido, estadoEnElabId, {
      estaAsignado: true,
      mailUsuarioCocinero: dto.mailUsuarioCocinero,
      idPerfilCocinero: dto.idPerfilCocinero,
      responsable: responsable ?? null,
    }, [ESTADOS.CREADO]);
  }

  async finalizarElaboracion(
    numPedido: number,
    elaborador?: string,
    cantidadRealPaquetes?: number,
    depositador?: string,
    opts?: { unidadesPorCaja?: number; idDepositoDestino?: number; diasVencimientoOverride?: number }
  ) {
    const pedido = await this.detail(numPedido);
    if (pedido.cambioActual?.estado?.nombre !== ESTADOS.EN_ELAB) {
      throw new Error("Solo pedidos en EnElaboración pueden finalizarse");
    }

    if (cantidadRealPaquetes === undefined || !Number.isSafeInteger(cantidadRealPaquetes) || cantidadRealPaquetes <= 0) {
      throw new Error("Debe ingresar la cantidad real elaborada en paquetes enteros (mayor a 0)");
    }

    if (!opts?.unidadesPorCaja || !Number.isSafeInteger(opts.unidadesPorCaja) || opts.unidadesPorCaja <= 0) {
      throw new Error("Indicá unidades enteras por caja para finalizar con lote y stock. Usá Finalizar elaboración.");
    }
    if (!elaborador?.trim() || !depositador?.trim() || elaborador.trim().toLowerCase() === depositador.trim().toLowerCase()) {
      throw new Error("Indicá elaborador y depositador diferentes");
    }
    const dep = await prisma.deposito.findFirst({ where: { nombre: "Fábrica-Atrás", estado: true } });
    if (!dep) throw new Error("No se encontró el depósito activo Fábrica-Atrás");
    if (opts.idDepositoDestino != null && opts.idDepositoDestino !== dep.id) throw new Error("La elaboración ingresa en Fábrica-Atrás");

    // Convertir cantidad real a gramos y porciones
    const producto = pedido.productoSnapshot != null
      ? productoRegistradoSchema.parse(pedido.productoSnapshot)
      : await prisma.producto.findUnique({
          where: { idProducto: pedido.idProducto },
          include: { formula: true },
        });
    if (!producto) throw new Error("Producto no encontrado");
    if (producto.idProducto !== pedido.idProducto) throw new Error('La composición registrada no corresponde al producto de la orden');

    const cantidades = this.convertirCantidades({ paquetes: cantidadRealPaquetes }, producto);
    const realPaquetes = round4(cantidadRealPaquetes);
    const realGramos = cantidades.cantAProducir_gramos;
    const realPorciones = cantidades.cantAProducir_porciones;
    const totalUnidades = realPaquetes;

    const estadoElabFabId = await this.getEstadoId(ESTADOS.ELAB_FAB);

    // Todo cierre nuevo crea lote y cajas; el inventario legacy queda intacto.
    let numeroLote: string | undefined;
    let fechaElaboracion: Date | undefined;
    let fechaVencimiento: Date | undefined;
    let cajasData: { idDeposito: number; unidades: number }[] = [];

    const upc = opts!.unidadesPorCaja!;
    if (!Number.isInteger(upc) || upc <= 0) {
      throw new Error("Las unidades por caja deben ser un entero mayor a 0");
    }
    fechaElaboracion = new Date();
    const dias = opts?.diasVencimientoOverride ?? producto.diasVencimiento;
    if (dias == null || !Number.isSafeInteger(dias) || dias <= 0) {
      throw new Error(
        "Falta el vencimiento: configurá los días de vencimiento del producto o ingresalos al finalizar"
      );
    }
    fechaVencimiento = calcularVencimiento(fechaElaboracion, dias);
    // Reparto en cajas: cajas completas + una parcial con el resto.
    const completas = Math.floor(totalUnidades / upc);
    const resto = totalUnidades % upc;
    for (let i = 0; i < completas; i++) cajasData.push({ idDeposito: dep.id, unidades: upc });
    if (resto > 0) cajasData.push({ idDeposito: dep.id, unidades: resto });

    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "numPedido" FROM "PEDIDOS" WHERE "numPedido" = ${numPedido} FOR UPDATE`;
      const actual = await tx.pedido.findUnique({ where: { numPedido }, include: { cambioActual: { include: { estado: true } } } });
      if (actual?.cambioActual?.estado?.nombre !== ESTADOS.EN_ELAB) throw new Error("La orden ya fue finalizada o cambió de estado. Actualizá la pantalla.");
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(464702, hashtext(${slugProducto(producto.nombreComercial)}))`;
      numeroLote = await this.lotesService.generarNumeroDisponible(producto.nombreComercial, fechaElaboracion!, tx);
      // 1. Cerrar estado actual y abrir nuevo estado
      if (pedido.idCambioEstadoPedido) {
        await tx.cambioEstadoPedido.update({
          where: { idCambioEstado: pedido.idCambioEstadoPedido },
          data: { fechaHoraFin: new Date() },
        });
      }
      const nuevoCambio = await tx.cambioEstadoPedido.create({
        data: {
          idPedido: numPedido,
          idEstadoPedido: estadoElabFabId,
          fechaHoraInicio: new Date(),
          responsable: elaborador ?? null,
          depositador: depositador ?? null,
        },
      });

      // 2. Actualizar pedido: nuevo estado + cantidades reales elaboradas
      await tx.pedido.update({
        where: { numPedido },
        data: {
          idCambioEstadoPedido: nuevoCambio.idCambioEstado,
          estaAsignado: false,
          cantElaborada_paquetes: realPaquetes,
          cantElaborada_gramos: realGramos,
          cantElaborada_porciones: realPorciones,
        },
      });

      // 3. Stock físico por lote y cajas, sin incrementar el contador legacy.
      await tx.lote.create({
          data: {
            numeroLote: numeroLote!,
            idProducto: pedido.idProducto,
            idPedido: numPedido,
            fechaElaboracion: fechaElaboracion!,
            fechaVencimiento: fechaVencimiento!,
            cajas: { create: cajasData },
          },
        });
    });

    // Retornar pedido actualizado completo
    return this.detail(numPedido);
  }

  async iniciarElaboracion(numPedido: number, responsable?: string) {
    const pedido = await this.detail(numPedido);
    if (pedido.cambioActual?.estado?.nombre !== ESTADOS.CREADO) {
      throw new Error("Solo pedidos en Creado pueden iniciarse");
    }
    const estadoEnElabId = await this.getEstadoId(ESTADOS.EN_ELAB);
    return this.repo.transition(numPedido, estadoEnElabId, { responsable: responsable ?? null }, [ESTADOS.CREADO]);
  }

  async aprobar(numPedido: number) {
    // Nota: la lógica de 'aprobar' no está definida en el servicio actualmente.
    // Se deja una implementación mínima que informa que la operación no está
    // implementada en el backend para evitar fallos de compilación.
    throw new Error("Operación 'aprobar' no implementada en el backend");
  }

  async rechazar(numPedido: number) {
    // Nota: la lógica de 'rechazar' no está definida en el servicio actualmente.
    // Se deja una implementación mínima que informa que la operación no está
    // implementada en el backend para evitar fallos de compilación.
    throw new Error("Operación 'rechazar' no implementada en el backend");
  }

  async cancelar(numPedido: number, responsable?: string) {
    const pedido = await this.detail(numPedido);
    const estado = pedido.cambioActual?.estado?.nombre;
    if (estado !== ESTADOS.CREADO && estado !== ESTADOS.EN_ELAB) {
      throw new Error(
        "Solo pedidos en Creado o EnElaboración pueden cancelarse"
      );
    }
    const estadoCanceladoId = await this.getEstadoId(ESTADOS.CANCELADO);
    return this.repo.transition(numPedido, estadoCanceladoId, {
      estaAsignado: false,
      responsable: responsable ?? null,
    }, [ESTADOS.CREADO, ESTADOS.EN_ELAB]);
  }
}
