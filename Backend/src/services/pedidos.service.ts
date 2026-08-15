import { prisma } from "../lib/prisma";
import { PedidosRepository } from "../repositories/pedidos.repository";
import { LotesService } from "./lotes.service";
import { calcularVencimiento } from "../utils/lote";

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
    if (!pesoPaquete || !porcion)
      throw new Error("Producto o fórmula inválidos para conversión");

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

    if (g! <= 0 || pqt! <= 0 || por! <= 0)
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

    return this.repo.createWithEstadoCreado(dataPedido, estadoCreadoId);
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
    });
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

    if (cantidadRealPaquetes === undefined || !Number.isFinite(cantidadRealPaquetes) || cantidadRealPaquetes <= 0) {
      throw new Error("Debe ingresar la cantidad real elaborada (mayor a 0)");
    }

    // Depósito destino (atrás). Prioridad: el que manda el front; si no, Fábrica-Atrás; si no, Fábrica.
    let dep = opts?.idDepositoDestino
      ? await prisma.deposito.findUnique({ where: { id: opts.idDepositoDestino } })
      : null;
    if (!dep) {
      dep = await prisma.deposito.findFirst({
        where: { nombre: { in: ["Fábrica-Atrás", "Fábrica"] } },
        orderBy: { nombre: "asc" }, // "Fábrica-Atrás" antes que "Fábrica"
      });
    }
    if (!dep) {
      throw new Error("No se encontró el depósito de destino (Fábrica-Atrás / Fábrica).");
    }

    // Convertir cantidad real a gramos y porciones
    const producto = await prisma.producto.findUnique({
      where: { idProducto: pedido.idProducto },
      include: { formula: true },
    });
    if (!producto) throw new Error("Producto no encontrado");

    const cantidades = this.convertirCantidades({ paquetes: cantidadRealPaquetes }, producto);
    const realPaquetes = round4(cantidadRealPaquetes);
    const realGramos = cantidades.cantAProducir_gramos;
    const realPorciones = cantidades.cantAProducir_porciones;
    const totalUnidades = Math.round(realPaquetes);

    const estadoElabFabId = await this.getEstadoId(ESTADOS.ELAB_FAB);

    // ¿Registramos lote+cajas? Solo si el front manda unidades por caja (flujo nuevo).
    // El endpoint legacy /finalizar (sin opts) mantiene el impacto al Inventario agregado.
    const crearLote = opts?.unidadesPorCaja != null;

    let numeroLote: string | undefined;
    let fechaElaboracion: Date | undefined;
    let fechaVencimiento: Date | undefined;
    let cajasData: { idDeposito: number; unidades: number }[] = [];

    if (crearLote) {
      const upc = opts!.unidadesPorCaja!;
      if (!Number.isInteger(upc) || upc <= 0) {
        throw new Error("Las unidades por caja deben ser un entero mayor a 0");
      }
      fechaElaboracion = new Date();
      const dias = opts?.diasVencimientoOverride ?? producto.diasVencimiento;
      if (dias == null) {
        throw new Error(
          "Falta el vencimiento: configurá los días de vencimiento del producto o ingresalos al finalizar"
        );
      }
      fechaVencimiento = calcularVencimiento(fechaElaboracion, dias);
      numeroLote = await this.lotesService.generarNumeroDisponible(
        producto.nombreComercial,
        fechaElaboracion
      );
      // Reparto en cajas: cajas completas + una parcial con el resto.
      const completas = Math.floor(totalUnidades / upc);
      const resto = totalUnidades % upc;
      for (let i = 0; i < completas; i++) cajasData.push({ idDeposito: dep.id, unidades: upc });
      if (resto > 0) cajasData.push({ idDeposito: dep.id, unidades: resto });
    }

    await prisma.$transaction(async (tx) => {
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

      // 3. Stock. Flujo nuevo: crear Lote + Cajas (fuente de verdad). Legacy: Inventario agregado.
      if (crearLote) {
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
      } else if (totalUnidades > 0) {
        await tx.inventario.upsert({
          where: { idDeposito_idProducto: { idDeposito: dep.id, idProducto: pedido.idProducto } },
          update: { cantidadProducto: { increment: totalUnidades } as any },
          create: { idDeposito: dep.id, idProducto: pedido.idProducto, cantidadProducto: totalUnidades, umbralMin: 0 },
        });
      }
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
    return this.repo.transition(numPedido, estadoEnElabId, { responsable: responsable ?? null });
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
    });
  }
}
