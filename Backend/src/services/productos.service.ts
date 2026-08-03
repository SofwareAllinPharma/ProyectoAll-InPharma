import { ProductosRepository } from "../repositories/productos.repository";
import { prisma } from "../lib/prisma";

export class ProductosService {
  repo = new ProductosRepository();

  async list(params: { search?: string; formula?: string; insumo?: string }) {
    return this.repo.findAll(params);
  }

  async detail(idProducto: number) {
    return this.repo.findById(idProducto);
  }

  async createProducto(dto: any) {
    if (
      !dto.nombreComercial ||
      typeof dto.nombreComercial !== "string" ||
      !dto.nombreComercial.trim()
    ) {
      throw new Error("El nombre comercial es obligatorio");
    }

    // Verificar que no exista un producto activo con el mismo nombre
    const existingProduct = await prisma.producto.findFirst({
      where: {
        nombreComercial: dto.nombreComercial.trim(),
        estaActivo: true,
      },
    });

    if (existingProduct) {
      throw new Error("Ya existe un producto activo con ese nombre comercial");
    }

    if (!dto.idFormula) throw new Error("Debe indicar una fórmula");
    const formula = await prisma.formula.findUnique({
      where: { id: dto.idFormula },
    });
    if (!formula) throw new Error("Fórmula no encontrada");
    //if (formula.esProtegida)
    //throw new Error("No se puede crear producto con fórmula protegida");

    let pesoNeto = dto.pesoNeto;
    let cantPorcionesAportadas = dto.cantPorcionesAportadas;

    if (pesoNeto && cantPorcionesAportadas) {
      cantPorcionesAportadas =
        Math.round((pesoNeto / formula.porcion) * 10000) / 10000;
    } else if (pesoNeto) {
      cantPorcionesAportadas =
        Math.round((pesoNeto / formula.porcion) * 10000) / 10000;
    } else if (cantPorcionesAportadas) {
      pesoNeto =
        Math.round(cantPorcionesAportadas * formula.porcion * 10000) / 10000;
    } else {
      throw new Error("Debe indicar peso neto o cantidad de porciones");
    }

    if (pesoNeto <= 0) throw new Error("El peso neto debe ser mayor a 0");
    if (cantPorcionesAportadas <= 0)
      throw new Error("La cantidad de porciones debe ser mayor a 0");

    const sku = normalizarSku(dto.sku);
    if (sku) {
      const skuEnUso = await prisma.producto.findFirst({
        where: { sku, estaActivo: true },
      });
      if (skuEnUso) throw new Error("Ya existe un producto activo con ese SKU");
    }

    return this.repo.create({
      nombreComercial: dto.nombreComercial,
      sku,
      idFormula: dto.idFormula,
      pesoNeto,
      cantPorcionesAportadas,
      estaActivo: true,
    });
  }

  async updateProducto(idProducto: number, dto: any) {
    const producto = await prisma.producto.findUnique({
      where: { idProducto },
    });
    if (!producto) throw new Error("Producto no encontrado");

    // Verificar que no exista otro producto activo con el mismo nombre (si se está cambiando el nombre)
    if (
      dto.nombreComercial &&
      dto.nombreComercial.trim() !== producto.nombreComercial
    ) {
      const existingProduct = await prisma.producto.findFirst({
        where: {
          nombreComercial: dto.nombreComercial.trim(),
          estaActivo: true,
          idProducto: { not: idProducto }, // Excluir el producto actual
        },
      });

      if (existingProduct) {
        throw new Error(
          "Ya existe un producto activo con ese nombre comercial"
        );
      }
    }

    const formula = await prisma.formula.findUnique({
      where: { id: dto.idFormula ?? producto.idFormula },
    });
    if (!formula) throw new Error("Fórmula no encontrada");
    if (formula.esProtegida)
      throw new Error("No se puede modificar producto con fórmula protegida");

    let pesoNeto = dto.pesoNeto;
    let cantPorcionesAportadas = dto.cantPorcionesAportadas;

    if (pesoNeto && cantPorcionesAportadas) {
      cantPorcionesAportadas =
        Math.round((pesoNeto / formula.porcion) * 10000) / 10000;
    } else if (pesoNeto) {
      cantPorcionesAportadas =
        Math.round((pesoNeto / formula.porcion) * 10000) / 10000;
    } else if (cantPorcionesAportadas) {
      pesoNeto =
        Math.round(cantPorcionesAportadas * formula.porcion * 10000) / 10000;
    } else {
      throw new Error("Debe indicar peso neto o cantidad de porciones");
    }

    if (pesoNeto <= 0) throw new Error("El peso neto debe ser mayor a 0");
    if (cantPorcionesAportadas <= 0)
      throw new Error("La cantidad de porciones debe ser mayor a 0");

    // sku undefined => no se toca; "" => se limpia a null
    const sku = dto.sku === undefined ? producto.sku : normalizarSku(dto.sku);
    if (sku && sku !== producto.sku) {
      const skuEnUso = await prisma.producto.findFirst({
        where: { sku, estaActivo: true, idProducto: { not: idProducto } },
      });
      if (skuEnUso) throw new Error("Ya existe un producto activo con ese SKU");
    }

    return this.repo.update(idProducto, {
      nombreComercial: dto.nombreComercial ?? producto.nombreComercial,
      sku,
      idFormula: dto.idFormula ?? producto.idFormula,
      pesoNeto,
      cantPorcionesAportadas,
      estaActivo: true,
    });
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

    const detalle = producto.formula.formulaInsumos.map((fi) => {
      const precioActivo = fi.insumo.precios[0] ?? null;
      const gramos = fi.cantidadInsumo;
      const precioPorKg = precioActivo?.precioPorKg ?? null;

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

    return {
      idProducto: producto.idProducto,
      nombreComercial: producto.nombreComercial,
      cantPorcionesAportadas: producto.cantPorcionesAportadas,
      costoPorPorcion: Math.round(costoPorPorcion * 100) / 100,
      costoPorPaquete: Math.round(costoPorPaquete * 100) / 100,
      esParcial: insumosSinPrecio.length > 0,
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
