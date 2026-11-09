import type { Pedido } from '../types/pedido.types';
import type { Producto } from '../../productos/types/producto.types';
import type { ApiFormula } from '../../formulas/types/api-types';
import { fromApi } from '../../formulas/lib/mappers';

/** Las órdenes nuevas usan su composición registrada incluso si el catálogo cambió. */
export function productoParaOrden(pedido: Pedido, actual?: Producto | null): Producto | null {
  if (pedido.productoSnapshot == null) {
    return actual?.idProducto === pedido.idProducto ? actual : null;
  }
  const snapshot = pedido.productoSnapshot;
  if (typeof snapshot !== 'object' || Array.isArray(snapshot)) return null;
  const producto = snapshot as Record<string, unknown>;
  const formula = producto.formula as ApiFormula | undefined;
  if (producto.idProducto !== pedido.idProducto || !formula || !Array.isArray(formula.formulaInsumos)) return null;
  return { ...producto, formula: fromApi(formula) } as unknown as Producto;
}

export function descripcionComposicion(pedido: Pedido): string {
  if (pedido.productoSnapshot != null) {
    return 'Composición y presentación registradas al crear esta orden. Requerimientos estimados de elaboración.';
  }
  return 'Orden anterior sin copia histórica. Composición actual al emitir y requerimientos estimados.';
}
