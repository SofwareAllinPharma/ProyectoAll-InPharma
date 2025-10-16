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

    return this.repo.create({
      nombreComercial: dto.nombreComercial,
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

    return this.repo.update(idProducto, {
      nombreComercial: dto.nombreComercial ?? producto.nombreComercial,
      idFormula: dto.idFormula ?? producto.idFormula,
      pesoNeto,
      cantPorcionesAportadas,
      estaActivo: true,
    });
  }

  async softDeleteProducto(idProducto: number) {
    return this.repo.softDelete(idProducto);
  }
}
