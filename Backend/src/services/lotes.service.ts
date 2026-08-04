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
  private async generarNumeroDisponible(
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

  // Stock de un depósito derivado de las cajas: total por producto + desglose por lote (FIFO).
  async stockPorDeposito(idDeposito: number) {
    const cajas = await prisma.caja.findMany({
      where: { idDeposito },
      include: { lote: { include: { producto: true } } },
      orderBy: { lote: { fechaElaboracion: "asc" } }, // más viejo primero = FIFO
    });

    const porProducto = new Map<
      number,
      {
        idProducto: number;
        nombreComercial: string;
        totalUnidades: number;
        lotes: {
          idLote: number;
          numeroLote: string;
          fechaVencimiento: Date;
          unidades: number;
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
          lotes: [],
        };
        porProducto.set(p.idProducto, entry);
      }
      entry.totalUnidades += caja.unidades;
      const loteEntry = entry.lotes.find((l) => l.idLote === caja.idLote);
      if (loteEntry) {
        loteEntry.unidades += caja.unidades;
      } else {
        entry.lotes.push({
          idLote: caja.lote.id,
          numeroLote: caja.lote.numeroLote,
          fechaVencimiento: caja.lote.fechaVencimiento,
          unidades: caja.unidades,
        });
      }
    }

    return Array.from(porProducto.values());
  }
}
