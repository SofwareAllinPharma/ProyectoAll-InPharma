import { prisma } from "../lib/prisma";
import { PedidosRepository } from "../repositories/pedidos.repository";

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

  async finalizarElaboracion(numPedido: number, responsable?: string) {
    const pedido = await this.detail(numPedido);
    if (pedido.cambioActual?.estado?.nombre !== ESTADOS.EN_ELAB) {
      throw new Error("Solo pedidos en EnElaboración pueden finalizarse");
    }

    // Asegurar depósito “Fábrica”
    const dep = await prisma.deposito.upsert({
      where: { nombre: "Fábrica" },
      update: {},
      create: {
        nombre: "Fábrica",
        direccion: "No especificada",
        responsable: "Sistema",
        capacidadTotal: 100000,
        capacidadUsada: 0,
        estado: true,
      },
    });

    const estadoElabFabId = await this.getEstadoId(ESTADOS.ELAB_FAB);

    // Transition state first (this will update cambioActual) then add stock to inventario.
    const updated = await this.repo.transition(numPedido, estadoElabFabId, { estaAsignado: false, responsable: responsable ?? null });

    // Añadir stock al inventario del depósito Fábrica (cantidad en paquetes)
    const qty = Math.round(pedido.cantAProducir_paquetes || 0);
    if (qty > 0) {
      await prisma.inventario.upsert({
        where: { idDeposito_idProducto: { idDeposito: dep.id, idProducto: pedido.idProducto } },
        update: { cantidadProducto: { increment: qty } as any },
        create: { idDeposito: dep.id, idProducto: pedido.idProducto, cantidadProducto: qty, umbralMin: 0 },
      });
    }

    return updated;
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
