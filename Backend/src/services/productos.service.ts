import { cotizacionParaPrecios, precioEnArs } from './cotizacionBlue';
import { bloquearCatalogoComposicion } from './composicion';
import { ProductosRepository } from "../repositories/productos.repository";
import { prisma } from "../lib/prisma";
import type { Prisma } from '@prisma/client';
import { calcularComposicion, validarLineasComposicion } from './composicion';

const productoInclude = { formula: { include: { formulaInsumos: { include: { insumo: true } } } } } as const;
type ProductoCompleto = Prisma.ProductoGetPayload<{ include: typeof productoInclude }>;


export class ProductosService {
  repo = new ProductosRepository();

  async list(params: { search?: string; formula?: string; insumo?: string }) {
    return this.repo.findAll(params);
  }

  async detail(idProducto: number) {
    return this.repo.findById(idProducto);
  }

  async createProducto(dto: any) {
    const nombre = nombreProducto(dto.nombreComercial);
    return prisma.$transaction(async tx => {
      await bloquearCatalogoComposicion(tx);
      if (await tx.producto.findFirst({ where: { nombreComercial: { equals: nombre, mode: 'insensitive' }, estaActivo: true } })) throw new Error('Ya existe un producto activo con ese nombre comercial');
      const formula = await this.resolverComposicion(tx, dto, nombre);
      const dimensiones = dimensionesProducto(dto, formula.porcion);
      const sku = normalizarSku(dto.sku);
      if (sku && await tx.producto.findFirst({ where: { sku } })) throw new Error('Ya existe un producto con ese SKU');
      return tx.producto.create({
        data: { nombreComercial: nombre, sku, diasVencimiento: parseDiasVencimiento(dto.diasVencimiento), idFormula: formula.id, ...dimensiones, estaActivo: true },
        include: productoInclude,
      });
    });
  }

  async updateProducto(idProducto: number, dto: any) {
    return prisma.$transaction(async tx => {
      await bloquearCatalogoComposicion(tx);
      await tx.$queryRaw`SELECT "idProducto" FROM "PRODUCTOS" WHERE "idProducto" = ${idProducto} FOR UPDATE`;
      const producto = await tx.producto.findUnique({ where: { idProducto }, include: productoInclude });
      if (!producto || !producto.estaActivo) throw new Error('Producto no encontrado');
      const nombre = dto.nombreComercial === undefined ? producto.nombreComercial : nombreProducto(dto.nombreComercial);
      if (await tx.producto.findFirst({ where: { nombreComercial: { equals: nombre, mode: 'insensitive' }, estaActivo: true, idProducto: { not: idProducto } } })) throw new Error('Ya existe un producto activo con ese nombre comercial');
      const formula = await this.resolverComposicion(tx, dto, nombre, producto);
      const dimensiones = dimensionesProducto(dto, formula.porcion, producto);
      const sku = dto.sku === undefined ? producto.sku : normalizarSku(dto.sku);
      if (sku && await tx.producto.findFirst({ where: { sku, idProducto: { not: idProducto } } })) throw new Error('Ya existe un producto con ese SKU');
      return tx.producto.update({
        where: { idProducto },
        data: { nombreComercial: nombre, sku, diasVencimiento: dto.diasVencimiento === undefined ? producto.diasVencimiento : parseDiasVencimiento(dto.diasVencimiento), idFormula: formula.id, ...dimensiones },
        include: productoInclude,
      });
    });
  }

  private async resolverComposicion(tx: Prisma.TransactionClient, dto: any, nombre: string, producto?: ProductoCompleto) {
    const tipo = dto.tipoComposicion;
    if (tipo !== undefined && tipo !== 'formula' && tipo !== 'insumos') throw new Error('El tipo de composición debe ser fórmula o insumos');
    if (tipo === 'insumos') {
      if (dto.idFormula != null) throw new Error('No se puede enviar una fórmula al cargar insumos directamente');
      const lineas = validarLineasComposicion(dto.insumos);
      const actual = producto?.formula;
      if (actual?.tipoComposicion === 'producto' && actual.formulaInsumos.length === lineas.length && lineas.every(l => actual.formulaInsumos.some(a => a.idInsumo === l.idInsumo && a.cantidadInsumo === l.cantidadInsumo))) return actual;
      const { lineas: validadas, ...nutricion } = await calcularComposicion(tx, lineas);
      return tx.formula.create({ data: {
        nombre: `Composición de ${nombre}`,
        tipoComposicion: 'producto', esProtegida: true, activo: true, ...nutricion,
        formulaInsumos: { create: validadas },
      } });
    }
    if (dto.insumos !== undefined) throw new Error('Para cargar insumos elegí el modo de composición directa');
    const id = dto.idFormula ?? producto?.idFormula;
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Debe indicar una fórmula reutilizable');
    await tx.$queryRaw`SELECT "id" FROM "FORMULA" WHERE "id" = ${id} FOR SHARE`;
    const formula = await tx.formula.findUnique({ where: { id } });
    if (!formula || !formula.activo) throw new Error('Fórmula inexistente o inactiva');
    // Una edición parcial conserva su propia composición; nunca puede tomar la de otro producto.
    const conservaPropia = tipo === undefined && producto?.idFormula === id && formula.tipoComposicion === 'producto';
    if (formula.tipoComposicion !== 'reutilizable' && !conservaPropia) throw new Error('La composición propia de un producto no es una fórmula reutilizable');
    return formula;
  }

  async softDeleteProducto(idProducto: number) {
    // Bloquear eliminación si hay pedidos en Creado/EnElaboración/ElaboradoYDepositadoEnFábrica
    const estadosNoPermitidos = [
      "Creado",
      "EnElaboración",
      "ElaboradoYDepositadoEnFábrica",
    ];
    const existe = await prisma.pedido.findFirst({
      where: {
        idProducto,
        cambioActual: { estado: { nombre: { in: estadosNoPermitidos } } },
      },
    });
    if (existe) {
      throw new Error(
        "No se puede eliminar el producto: tiene pedidos no cancelados"
      );
    }
    return this.repo.softDelete(idProducto);
  }

  async calcularCosto(idProducto: number) {
    const producto = await prisma.producto.findUnique({
      where: { idProducto },
      include: {
        formula: {
          include: {
            formulaInsumos: {
              include: {
                insumo: {
                  include: {
                    precios: {
                      where: { activo: true },
                      take: 1,
                      include: { proveedor: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!producto || !producto.estaActivo) throw new Error('Producto no encontrado');
    if (!producto.formula) throw new Error('El producto no tiene fórmula asociada');

    const insumosSinPrecio: string[] = [];
    let costoPorPorcion = 0;

    const blue = await cotizacionParaPrecios(producto.formula.formulaInsumos.map(fi => fi.insumo.precios[0]));
    const detalle = producto.formula.formulaInsumos.map((fi) => {
      const precioActivo = fi.insumo.precios[0] ?? null;
      const gramos = fi.cantidadInsumo;
      const precioPorKg = precioEnArs(precioActivo, blue);

      if (precioPorKg === null) {
        insumosSinPrecio.push(fi.insumo.nombre);
        return {
          insumo: fi.insumo.nombre,
          gramos,
          precioPorKg: null,
          proveedor: null,
          costoAporte: null,
        };
      }

      const costoAporte = (gramos / 1000) * precioPorKg;
      costoPorPorcion += costoAporte;

      return {
        insumo: fi.insumo.nombre,
        gramos,
        precioPorKg,
        proveedor: precioActivo?.proveedor
          ? { id: precioActivo.proveedor.id, nombre: precioActivo.proveedor.nombre }
          : null,
        costoAporte: Math.round(costoAporte * 100) / 100,
      };
    });

    const costoPorPaquete = costoPorPorcion * producto.cantPorcionesAportadas;
    const esParcial = insumosSinPrecio.length > 0 || detalle.length === 0;

    return {
      idProducto: producto.idProducto,
      nombreComercial: producto.nombreComercial,
      cantPorcionesAportadas: producto.cantPorcionesAportadas,
      cotizacionBlue: blue,
      costoPorPorcion: esParcial ? null : Math.round(costoPorPorcion * 100) / 100,
      costoPorPaquete: esParcial ? null : Math.round(costoPorPaquete * 100) / 100,
      esParcial,
      insumosSinPrecio,
      detalle,
    };
  }
}

// Normaliza el SKU: solo trim (se preserva el case para matchear exacto
// con WooCommerce, que es case-sensitive). Devuelve null si queda vacío.
function normalizarSku(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

// Días de vencimiento: entero >= 1, o null si viene vacío. Lanza si es inválido.
function parseDiasVencimiento(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0)
    throw new Error("Los días de vencimiento deben ser un entero mayor a 0");
  return n;
}

function nombreProducto(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('El nombre comercial es obligatorio');
  return raw.trim();
}

function dimensionesProducto(dto: { pesoNeto?: unknown; cantPorcionesAportadas?: unknown }, porcion: number, actual?: { pesoNeto: number }) {
  if (!Number.isFinite(porcion) || porcion <= 0) throw new Error('La composición debe tener una porción válida');
  let pesoNeto: number;
  let cantPorcionesAportadas: number;
  for (const value of [dto.pesoNeto, dto.cantPorcionesAportadas]) {
    if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)) throw new Error('Peso neto y porciones deben ser números finitos mayores a 0');
  }
  if (typeof dto.pesoNeto === 'number') {
    pesoNeto = dto.pesoNeto;
    cantPorcionesAportadas = Math.round(pesoNeto / porcion * 10000) / 10000;
  } else if (typeof dto.cantPorcionesAportadas === 'number') {
    cantPorcionesAportadas = dto.cantPorcionesAportadas;
    pesoNeto = Math.round(cantPorcionesAportadas * porcion * 10000) / 10000;
  } else if (actual) {
    pesoNeto = actual.pesoNeto;
    cantPorcionesAportadas = Math.round(pesoNeto / porcion * 10000) / 10000;
  } else throw new Error('Debe indicar peso neto o cantidad de porciones');
  if (!Number.isFinite(pesoNeto) || !Number.isFinite(cantPorcionesAportadas) || pesoNeto <= 0 || cantPorcionesAportadas <= 0) throw new Error('La presentación calculada debe ser finita y mayor a 0');
  return { pesoNeto, cantPorcionesAportadas };
}
