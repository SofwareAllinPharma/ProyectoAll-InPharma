import { prisma } from "../lib/prisma";

export class PedidosRepository {
  async list(pagina: number, pageSize: number) {
    const skip = (pagina - 1) * pageSize;
    const [items, total] = await prisma.$transaction([
      prisma.pedido.findMany({
        include: {
          producto: { include: { formula: true } },
          cambioActual: { include: { estado: true } },
          creador: { include: { usuario: { include: { persona: true } }, perfil: true } },
          cocinero: { include: { usuario: { include: { persona: true } }, perfil: true } },
        },
        orderBy: [{ estaAsignado: "asc" }, { createdAt: "asc" }],
        skip,
        take: pageSize,
      }),
      prisma.pedido.count(),
    ]);
    return {
      items,
      total,
      pagina,
      pageSize,
      paginas: Math.ceil(total / pageSize),
    };
  }

  async findById(numPedido: number) {
    if (!Number.isInteger(numPedido) || numPedido <= 0) {
      throw new Error('numPedido inválido');
    }

    return prisma.pedido.findUnique({
      where: { numPedido },
      include: {
        producto: { include: { formula: true } },
        cambioActual: { include: { estado: true } },
        cambios: {
          include: { estado: true },
          orderBy: { idCambioEstado: "asc" },
        },
        creador: { include: { usuario: { include: { persona: true } }, perfil: true } },
        cocinero: { include: { usuario: { include: { persona: true } }, perfil: true } },
      },
    });
  }

  async createWithEstadoCreado(data: any, estadoCreadoId: number) {
    return prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.create({ data });
      // Determine responsable from creator persona if available
      let responsable: string | null = null;
      try {
        if (data.mailUsuarioCreador) {
          const persona = await tx.persona.findUnique({ where: { mail: data.mailUsuarioCreador } });
          if (persona) {
            const n = `${(persona.nombre || '').trim()} ${(persona.apellido || '').trim()}`.trim();
            responsable = n || data.mailUsuarioCreador;
          } else {
            responsable = data.mailUsuarioCreador;
          }
        }
      } catch (e) {
        responsable = data.mailUsuarioCreador ?? null;
      }

      const cambio = await tx.cambioEstadoPedido.create({
        data: {
          idPedido: pedido.numPedido,
          idEstadoPedido: estadoCreadoId,
          fechaHoraInicio: new Date(),
          responsable,
        },
      });
      await tx.pedido.update({
        where: { numPedido: pedido.numPedido },
        data: { cambioActual: { connect: { idCambioEstado: cambio.idCambioEstado } } },
      });
      return tx.pedido.findUnique({
        where: { numPedido: pedido.numPedido },
        include: {
          cambioActual: { include: { estado: true } },
          producto: { include: { formula: true } },
        },
      });
    });
  }

  async transition(
    numPedido: number,
    nextEstadoId: number,
    extraData: any = {}
  ) {
    return prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({
        where: { numPedido },
        include: { cambioActual: true },
      });
      if (!pedido) throw new Error("Pedido no encontrado");

      if (pedido.idCambioEstadoPedido) {
        await tx.cambioEstadoPedido.update({
          where: { idCambioEstado: pedido.idCambioEstadoPedido },
          data: { fechaHoraFin: new Date() },
        });
      }

      const nuevoCambio = await tx.cambioEstadoPedido.create({
        data: {
          idPedido: numPedido,
          idEstadoPedido: nextEstadoId,
          fechaHoraInicio: new Date(),
          responsable: extraData.responsable ?? null,
        },
      });

      // Build explicit update data to avoid sending unknown keys (e.g. responsable)
      // Use the relation `cocinero` for connecting/disconnecting the UsuarioPerfil
      const updateData: any = {
        cambioActual: { connect: { idCambioEstado: nuevoCambio.idCambioEstado } },
      };
      if (typeof extraData.estaAsignado !== 'undefined') updateData.estaAsignado = extraData.estaAsignado;

      // Prefer setting the relation `cocinero` via connect/disconnect instead of
      // attempting to set the underlying scalar FK fields directly.
      const hasMail = typeof extraData.mailUsuarioCocinero !== 'undefined';
      const hasPerfil = typeof extraData.idPerfilCocinero !== 'undefined';
      if (hasMail || hasPerfil) {
        // Explicitly disconnect when null is provided
        if (extraData.mailUsuarioCocinero === null || extraData.idPerfilCocinero === null) {
          updateData.cocinero = { disconnect: true };
        } else if (hasMail && hasPerfil) {
          // Only connect when we have both mail and perfil
          // The relation `UsuarioPerfil` uses a compound primary key (mail, idPerfil).
          // Prisma expects the unique input under the generated compound field name
          // `mail_idPerfil` when connecting by the composite key.
          updateData.cocinero = {
            connect: {
              mail_idPerfil: {
                mail: extraData.mailUsuarioCocinero,
                idPerfil: extraData.idPerfilCocinero,
              },
            },
          };
        }
      }

      const updated = await tx.pedido.update({
        where: { numPedido },
        data: updateData,
        include: {
          cambioActual: { include: { estado: true } },
          producto: { include: { formula: true } },
        },
      });

      return updated;
    });
  }

  async existsPedidoNoCanceladoForProducto(
    idProducto: number,
    estadosNoPermitidos: string[]
  ) {
    return prisma.pedido.findFirst({
      where: {
        idProducto,
        cambioActual: { estado: { nombre: { in: estadosNoPermitidos } } },
      },
      include: { cambioActual: { include: { estado: true } } },
    });
  }
}
