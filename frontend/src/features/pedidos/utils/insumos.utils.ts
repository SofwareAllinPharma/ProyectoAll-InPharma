import type { Pedido } from "../types/pedido.types";
import type { Producto } from "../../productos/types/producto.types";

type FormulaInsumo = {
  idInsumo: number;
  cantidadInsumo: number;
  insumo?: { nombre?: string };
};

export interface InsumoRequerido {
  nombre: string;
  cantidad: number;
}

export function computeInsumosRequeridos(
  pedido: Pedido | null,
  productoDetalle: Producto | null
): InsumoRequerido[] {
  if (!pedido || !pedido.cantAProducir_gramos) return [];

  const prod = (productoDetalle ?? pedido.producto) as unknown as {
    formula?: { insumos?: FormulaInsumo[] };
  };

  const insumos: FormulaInsumo[] = prod?.formula?.insumos ?? [];
  const totalFormula =
    insumos.reduce(
      (s: number, i: FormulaInsumo) => s + (i.cantidadInsumo || 0),
      0
    ) || 0;

  const factor =
    totalFormula > 0 ? Number(pedido.cantAProducir_gramos) / totalFormula : 0;

  return insumos.map((fi: FormulaInsumo) => ({
    nombre: fi.insumo?.nombre || `Insumo ${fi.idInsumo}`,
    cantidad: +((fi.cantidadInsumo || 0) * factor).toFixed(4),
  }));
}
