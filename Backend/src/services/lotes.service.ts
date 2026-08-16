import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { slugProducto, generarNumeroLote, calcularVencimiento } from "../utils/lote";

type CajaInput = { idDeposito: number; unidades: number };

export class LotesService {
  async crear(dto: any) {
    const producto = await prisma.producto.findUnique({
      where: { idProducto: dto.idProducto },
    });
    if (!producto) throw new Error("Producto no encontrado");

    if (!Array.isArray(dto.cajas) || dto.cajas.length === 0)
      throw new Error("Debe indicar al menos una caja");
    for (const c of dto.cajas as CajaInput[]) {
      if (!c.idDeposito) throw new Error("Cada caja debe indicar depósito");
      if (!Number.isInteger(c.unidades) || c.unidades <= 0)
        throw new Error("Cada caja debe tener unidades enteras mayores a 0");
    }

    const fechaElaboracion = dto.fechaElaboracion
      ? new Date(dto.fechaElaboracion)
      : new Date();

    // Vencimiento: explícito > días del producto (uno de los dos es obligatorio).
    let fechaVencimiento: Date;
    if (dto.fechaVencimiento) {
      fechaVencimiento = new Date(dto.fechaVencimiento);
    } else if (producto.diasVencimiento != null) {
      fechaVencimiento = calcularVencimiento(fechaElaboracion, producto.diasVencimiento);
    } else {
      throw new Error(
        "Falta la fecha de vencimiento: el producto no tiene días de vencimiento configurados"
      );
    }

    // Número de lote: el provisto (editable) o autogenerado.
    const numeroLote = dto.numeroLote?.trim()
      ? dto.numeroLote.trim()
      : await this.generarNumeroDisponible(producto.nombreComercial, fechaElaboracion);

    return prisma.lote.create({
      data: {
        numeroLote,
        idProducto: dto.idProducto,
        idPedido: dto.idPedido ?? null,
        fechaElaboracion,
        fechaVencimiento,
        cajas: {
          create: (dto.cajas as CajaInput[]).map((c) => ({
            idDeposito: c.idDeposito,
            unidades: c.unidades,
          })),
        },
      },
      include: { cajas: { include: { deposito: true } }, producto: true },
    });
  }

  // Secuencia diaria por producto; busca el primer número libre (numeroLote es único).
  async generarNumeroDisponible(
    nombreProducto: string,
    fecha: Date
  ): Promise<string> {
    const slug = slugProducto(nombreProducto);
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    const delDia = await prisma.lote.count({
      where: {
        fechaElaboracion: { gte: inicio, lte: fin },
        producto: { nombreComercial: nombreProducto },
      },
    });

    let secuencia = delDia + 1;
    for (let i = 0; i < 100; i++) {
      const numero = generarNumeroLote(fecha, slug, secuencia);
      const existe = await prisma.lote.findUnique({ where: { numeroLote: numero } });
      if (!existe) return numero;
      secuencia++;
    }
    throw new Error("No se pudo generar un número de lote único");
  }

  async list(params: { idProducto?: number } = {}) {
    return prisma.lote.findMany({
      where: { ...(params.idProducto ? { idProducto: params.idProducto } : {}) },
      include: { producto: true, cajas: { include: { deposito: true } } },
      orderBy: { fechaElaboracion: "desc" },
    });
  }

  async detail(id: number) {
    return prisma.lote.findUnique({
      where: { id },
      include: {
        producto: true,
        pedido: true,
        cajas: { include: { deposito: true } },
      },
    });
  }

  // Traslada N cajas enteras de un producto entre depósitos, eligiendo por FIFO
  // (lote más viejo primero), con doble firma (dos responsables distintos).
  async trasladar(dto: {
    idDepositoOrigen: number;
    idDepositoDestino: number;
    idProducto: number;
    cantidadCajas: number;
    responsableEnvio?: string;
    responsableRecepcion?: string;
  }) {
    const { idDepositoOrigen, idDepositoDestino, idProducto, cantidadCajas } = dto;
    if (!idDepositoOrigen || !idDepositoDestino)
      throw new Error("Indicá depósito de origen y destino");
    if (idDepositoOrigen === idDepositoDestino)
      throw new Error("El origen y el destino no pueden ser el mismo depósito");
    if (!Number.isInteger(cantidadCajas) || cantidadCajas <= 0)
      throw new Error("La cantidad de cajas debe ser un entero mayor a 0");

    const envio = dto.responsableEnvio?.trim();
    const recepcion = dto.responsableRecepcion?.trim();
    if (!envio || !recepcion)
      throw new Error("Doble verificación: indicá responsable de envío y de recepción");
    if (envio.toLowerCase() === recepcion.toLowerCase())
      throw new Error("La segunda firma debe ser de una persona distinta");

    // Cajas del producto en el origen (con stock), más viejas primero (FIFO).
    const cajas = await prisma.caja.findMany({
      where: { idDeposito: idDepositoOrigen, unidades: { gt: 0 }, lote: { idProducto } },
      orderBy: { lote: { fechaElaboracion: "asc" } },
    });
    if (cajas.length < cantidadCajas)
      throw new Error(
        `No hay suficientes cajas en el origen (hay ${cajas.length}, se pidieron ${cantidadCajas})`
      );

    const aMover = cajas.slice(0, cantidadCajas);

    const res = await prisma.$transaction(async (tx) => {
      for (const caja of aMover) {
        await tx.movimientoCaja.create({
          data: {
            idCaja: caja.id,
            idDepositoOrigen,
            idDepositoDestino,
            responsableEnvio: envio,
            responsableRecepcion: recepcion,
          },
        });
        await tx.caja.update({
          where: { id: caja.id },
          data: { idDeposito: idDepositoDestino },
        });
      }
      return { movidas: aMover.length, unidades: aMover.reduce((s, c) => s + c.unidades, 0) };
    });

    // Si el traslado tocó la estantería, avisar a Woo (best-effort, post-commit).
    void this.notificarSiEstanteria(idDepositoDestino, [idProducto]);
    void this.notificarSiEstanteria(idDepositoOrigen, [idProducto]);
    return res;
  }

  // Egreso por unidades (venta/salida): descuenta de la estantería por FIFO,
  // consumiendo cajas (puede dejar una parcial). Sin doble firma (venta rápida).
  async egresar(dto: {
    idDeposito: number;
    idProducto: number;
    unidades: number;
    motivo?: string;
    responsable?: string;
  }) {
    const res = await prisma.$transaction((tx) => this.egresarEnTx(tx, dto));
    void this.notificarSiEstanteria(dto.idDeposito, [dto.idProducto]);
    return res;
  }

  // Núcleo del egreso, reutilizable dentro de otra transacción (ej: venta de Woo).
  private async egresarEnTx(
    tx: Prisma.TransactionClient,
    dto: { idDeposito: number; idProducto: number; unidades: number; motivo?: string; responsable?: string }
  ) {
    const { idDeposito, idProducto } = dto;
    const unidades = Math.round(Number(dto.unidades));
    if (!idDeposito) throw new Error("Indicá el depósito");
    if (!idProducto) throw new Error("Indicá el producto");
    if (!Number.isInteger(unidades) || unidades <= 0)
      throw new Error("Las unidades deben ser un entero mayor a 0");

    const cajas = await tx.caja.findMany({
      where: { idDeposito, unidades: { gt: 0 }, lote: { idProducto } },
      orderBy: { lote: { fechaElaboracion: "asc" } },
    });
    const disponible = cajas.reduce((s, c) => s + c.unidades, 0);
    if (disponible < unidades)
      throw new Error(`Stock insuficiente: hay ${disponible} u, se pidieron ${unidades}`);

    const motivo = dto.motivo?.trim() || "VENTA";
    const responsable = dto.responsable?.trim() || null;

    let restante = unidades;
    for (const caja of cajas) {
      if (restante <= 0) break;
      const tomar = Math.min(caja.unidades, restante);
      await tx.caja.update({ where: { id: caja.id }, data: { unidades: caja.unidades - tomar } });
      await tx.egresoCaja.create({
        data: { idCaja: caja.id, idDeposito, unidades: tomar, motivo, responsable },
      });
      restante -= tomar;
    }
    return { unidades };
  }

  // Procesa una venta de WooCommerce (vía n8n): egresa de la estantería por SKU,
  // idempotente por orderId (no descuenta dos veces la misma orden).
  async procesarVentaWoo(dto: { orderId: string | number; items: { sku: string; unidades: number }[] }) {
    const orderId = String(dto.orderId ?? "").trim();
    if (!orderId) throw new Error("Falta orderId de la orden de Woo");
    if (!Array.isArray(dto.items) || dto.items.length === 0)
      throw new Error("La orden no tiene items");

    const ya = await prisma.wooOrderProcesada.findUnique({ where: { orderId } });
    if (ya) return { yaProcesada: true, orderId };

    const estanteria = await prisma.deposito.findFirst({
      where: { nombre: { in: ["Estantería", "Estanteria"] }, estado: true },
    });
    if (!estanteria) throw new Error("No se encontró el depósito 'Estantería'");

    // Resolver cada SKU a un producto antes de la transacción.
    const resueltos: { idProducto: number; unidades: number }[] = [];
    for (const it of dto.items) {
      const sku = String(it.sku ?? "").trim();
      if (!sku) throw new Error("Item sin SKU");
      const prod = await prisma.producto.findFirst({ where: { sku, estaActivo: true } });
      if (!prod) throw new Error(`SKU no encontrado en All-In-Pharma: ${sku}`);
      resueltos.push({ idProducto: prod.idProducto, unidades: Number(it.unidades) });
    }

    await prisma.$transaction(async (tx) => {
      // marca de idempotencia primero: si otra llamada concurrente la creó, falla y hace rollback
      await tx.wooOrderProcesada.create({ data: { orderId } });
      for (const r of resueltos) {
        await this.egresarEnTx(tx, {
          idDeposito: estanteria.id,
          idProducto: r.idProducto,
          unidades: r.unidades,
          motivo: "VENTA_WEB",
        });
      }
    });

    return { procesada: true, orderId, items: resueltos.length };
  }

  // Devuelve el id del depósito "Estantería" (o null si no existe).
  private async getEstanteriaId(): Promise<number | null> {
    const est = await prisma.deposito.findFirst({
      where: { nombre: { in: ["Estantería", "Estanteria"] }, estado: true },
      select: { id: true },
    });
    return est?.id ?? null;
  }

  // Si el depósito afectado es la estantería, avisa a n8n el nuevo stock (para actualizar Woo).
  private async notificarSiEstanteria(idDeposito: number, idProductos: number[]) {
    try {
      const url = process.env.N8N_STOCK_WEBHOOK_URL;
      if (!url) return;
      const estanteriaId = await this.getEstanteriaId();
      if (!estanteriaId || estanteriaId !== idDeposito) return;

      const productos = await Promise.all(
        idProductos.filter(Boolean).map(async (idProducto) => {
          const prod = await prisma.producto.findUnique({
            where: { idProducto },
            select: { sku: true },
          });
          const agg = await prisma.caja.aggregate({
            where: { idDeposito: estanteriaId, unidades: { gt: 0 }, lote: { idProducto } },
            _sum: { unidades: true },
          });
          return { sku: prod?.sku ?? null, unidades: agg._sum.unidades ?? 0 };
        })
      );

      const conSku = productos.filter((p) => p.sku);
      if (conSku.length === 0) return;

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productos: conSku }),
      });
    } catch (err) {
      console.error("[notificarSiEstanteria] no se pudo avisar a n8n:", err);
    }
  }

  // Stock de un depósito derivado de las cajas: total por producto + desglose por lote (FIFO).
  async stockPorDeposito(idDeposito: number) {
    const cajas = await prisma.caja.findMany({
      where: { idDeposito, unidades: { gt: 0 } },
      include: { lote: { include: { producto: true } } },
      orderBy: { lote: { fechaElaboracion: "asc" } }, // más viejo primero = FIFO
    });

    const porProducto = new Map<
      number,
      {
        idProducto: number;
        nombreComercial: string;
        totalUnidades: number;
        totalCajas: number;
        lotes: {
          idLote: number;
          numeroLote: string;
          fechaVencimiento: Date;
          unidades: number;
          cajas: number;
        }[];
      }
    >();

    for (const caja of cajas) {
      const p = caja.lote.producto;
      let entry = porProducto.get(p.idProducto);
      if (!entry) {
        entry = {
          idProducto: p.idProducto,
          nombreComercial: p.nombreComercial,
          totalUnidades: 0,
          totalCajas: 0,
          lotes: [],
        };
        porProducto.set(p.idProducto, entry);
      }
      entry.totalUnidades += caja.unidades;
      entry.totalCajas += 1;
      const loteEntry = entry.lotes.find((l) => l.idLote === caja.idLote);
      if (loteEntry) {
        loteEntry.unidades += caja.unidades;
        loteEntry.cajas += 1;
      } else {
        entry.lotes.push({
          idLote: caja.lote.id,
          numeroLote: caja.lote.numeroLote,
          fechaVencimiento: caja.lote.fechaVencimiento,
          unidades: caja.unidades,
          cajas: 1,
        });
      }
    }

    return Array.from(porProducto.values());
  }
}
