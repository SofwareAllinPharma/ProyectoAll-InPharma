import type { Pedido } from "../types/pedido.types";
import type { Producto } from "../../productos/types/producto.types";

type FormulaInsumo = {
  idInsumo: number;
  cantidadInsumo: number;
  insumo?: { nombre?: string };
};

export interface InsumoRequerido {
  idInsumo?: number;
  gramosPorPorcion?: number;
  nombre: string;
  cantidad: number;
}

export function computeInsumosRequeridos(
  pedido: Pedido | null,
  productoDetalle: Producto | null
): InsumoRequerido[] {
  if (!pedido || !Number.isFinite(pedido.cantAProducir_gramos) || pedido.cantAProducir_gramos <= 0) return [];

  const prod = (productoDetalle?.idProducto === pedido.idProducto ? productoDetalle : null) as unknown as {
    formula?: { insumos?: FormulaInsumo[] };
  };

  const insumos: FormulaInsumo[] = prod?.formula?.insumos ?? [];
  if (insumos.some(fi => !Number.isFinite(fi.cantidadInsumo) || fi.cantidadInsumo <= 0)) return [];
  const totalFormula =
    insumos.reduce(
      (s: number, i: FormulaInsumo) => s + (i.cantidadInsumo || 0),
      0
    ) || 0;

  const factor =
    totalFormula > 0 ? Number(pedido.cantAProducir_gramos) / totalFormula : 0;

  return insumos.map((fi: FormulaInsumo) => ({
    idInsumo: fi.idInsumo,
    gramosPorPorcion: fi.cantidadInsumo,
    nombre: fi.insumo?.nombre || `Insumo ${fi.idInsumo}`,
    cantidad: +((fi.cantidadInsumo || 0) * factor).toFixed(4),
  }));
}
