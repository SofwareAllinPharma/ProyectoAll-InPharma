"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidosService = void 0;
const prisma_1 = require("../lib/prisma");
const pedidos_repository_1 = require("../repositories/pedidos.repository");
const ESTADOS = {
    CREADO: "Creado",
    EN_ELAB: "EnElaboración",
    ELAB_FAB: "ElaboradoYDepositadoEnFábrica",
    CANCELADO: "Cancelado",
};
function round4(n) {
    return Math.round(n * 10000) / 10000;
}
class PedidosService {
    constructor() {
        this.repo = new pedidos_repository_1.PedidosRepository();
    }
    async list({ pagina = 1, pageSize = 10, }) {
        return this.repo.list(pagina, pageSize);
    }
    async detail(numPedido) {
        const p = await this.repo.findById(numPedido);
        if (!p)
            throw new Error("Pedido no encontrado");
        return p;
    }
    async getEstadoId(nombre) {
        const estado = await prisma_1.prisma.estadoPedido.findFirst({ where: { nombre } });
        if (!estado)
            throw new Error(`EstadoPedido "${nombre}" no existe`);
        return estado.id;
    }
    convertirCantidades({ gramos, paquetes, porciones, }, producto) {
        const pesoPaquete = Number(producto.pesoNeto);
        const porcion = Number(producto.formula?.porcion);
        if (!pesoPaquete || !porcion)
            throw new Error("Producto o fórmula inválidos para conversión");
        let g = gramos, pqt = paquetes, por = porciones;
        const hasG = typeof g === "number" && g > 0;
        const hasPqt = typeof pqt === "number" && pqt > 0;
        const hasPor = typeof por === "number" && por > 0;
        if (!hasG && !hasPqt && !hasPor)
            throw new Error("Debe indicar gramos, paquetes o porciones (> 0)");
        if (hasG) {
            pqt = round4(g / pesoPaquete);
            por = round4(g / porcion);
        }
        else if (hasPqt) {
            g = round4(pqt * pesoPaquete);
            por = round4(g / porcion);
        }
        else if (hasPor) {
            g = round4(por * porcion);
            pqt = round4(g / pesoPaquete);
        }
        if (g <= 0 || pqt <= 0 || por <= 0)
            throw new Error("Las cantidades convertidas deben ser > 0");
        return {
            cantAProducir_gramos: g,
            cantAProducir_paquetes: pqt,
            cantAProducir_porciones: por,
        };
    }
    async create(dto) {
        if (!dto.idProducto)
            throw new Error("idProducto es obligatorio");
        if (!dto.mailUsuarioCreador || !dto.idPerfilCreador)
            throw new Error("Datos del creador obligatorios");
        const producto = await prisma_1.prisma.producto.findUnique({
            where: { idProducto: dto.idProducto },
            include: { formula: true },
        });
        if (!producto || !producto.estaActivo)
            throw new Error("Producto no disponible");
        // Verificar que el creador exista con ese perfil (FK compuesta)
        const creador = await prisma_1.prisma.usuarioPerfil.findUnique({
            where: {
                mail_idPerfil: {
                    mail: dto.mailUsuarioCreador,
                    idPerfil: dto.idPerfilCreador,
                },
            },
        });
        if (!creador)
            throw new Error("El usuario creador no existe o no tiene asignado ese perfil");
        const cantidades = this.convertirCantidades({ gramos: dto.gramos, paquetes: dto.paquetes, porciones: dto.porciones }, producto);
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
    async tomarPedido(numPedido, dto) {
        if (!dto.mailUsuarioCocinero || !dto.idPerfilCocinero)
            throw new Error("Datos del cocinero obligatorios");
        const pedido = await this.detail(numPedido);
        if (pedido.estaAsignado)
            throw new Error("El pedido ya está asignado");
        if (pedido.cambioActual?.estado?.nombre !== ESTADOS.CREADO)
            throw new Error("Solo pedidos en estado Creado pueden tomarse");
        // Verificar que el cocinero exista con ese perfil (FK compuesta)
        const cocinero = await prisma_1.prisma.usuarioPerfil.findUnique({
            where: {
                mail_idPerfil: {
                    mail: dto.mailUsuarioCocinero,
                    idPerfil: dto.idPerfilCocinero,
                },
            },
        });
        if (!cocinero)
            throw new Error("El usuario cocinero no existe o no tiene asignado ese perfil");
        const estadoEnElabId = await this.getEstadoId(ESTADOS.EN_ELAB);
        return this.repo.transition(numPedido, estadoEnElabId, {
            estaAsignado: true,
            mailUsuarioCocinero: dto.mailUsuarioCocinero,
            idPerfilCocinero: dto.idPerfilCocinero,
        });
    }
    async finalizarElaboracion(numPedido) {
        const pedido = await this.detail(numPedido);
        if (pedido.cambioActual?.estado?.nombre !== ESTADOS.EN_ELAB) {
            throw new Error("Solo pedidos en EnElaboración pueden finalizarse");
        }
        // Asegurar depósito “Fábrica”
        await prisma_1.prisma.deposito.upsert({
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
        return this.repo.transition(numPedido, estadoElabFabId);
    }
    async cancelar(numPedido) {
        const pedido = await this.detail(numPedido);
        const estado = pedido.cambioActual?.estado?.nombre;
        if (estado !== ESTADOS.CREADO && estado !== ESTADOS.EN_ELAB) {
            throw new Error("Solo pedidos en Creado o EnElaboración pueden cancelarse");
        }
        const estadoCanceladoId = await this.getEstadoId(ESTADOS.CANCELADO);
        return this.repo.transition(numPedido, estadoCanceladoId, {
            estaAsignado: false,
        });
    }
}
exports.PedidosService = PedidosService;
