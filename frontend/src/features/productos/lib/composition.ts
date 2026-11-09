import type { Formula, FormulaInsumo } from '../../formulas/types/formula.types';
import type { Producto, CreateProductoRequest } from '../types/producto.types';

export type ProductoFormState = {
  idFormula: number;
  tipoComposicion: 'formula' | 'insumos';
  nombreComercial: string;
  sku: string;
  diasVencimiento: string;
  pesoNeto: number;
  cantPorcionesAportadas: number;
  calculationMode: 'pesoNeto' | 'porciones';
};
export const initialProductoForm = (producto?: Producto): ProductoFormState => ({
  idFormula: producto?.idFormula ?? 0,
  tipoComposicion: producto?.formula?.tipoComposicion === 'producto' ? 'insumos' : 'formula',
  nombreComercial: producto?.nombreComercial ?? '', sku: producto?.sku ?? '',
  diasVencimiento: producto?.diasVencimiento != null ? String(producto.diasVencimiento) : '',
  pesoNeto: producto?.pesoNeto ?? 0, cantPorcionesAportadas: producto?.cantPorcionesAportadas ?? 0,
  calculationMode: producto?.formula?.tipoComposicion === 'producto' ? 'porciones' : 'pesoNeto',
});

export function directComposition(insumos: FormulaInsumo[]): Formula | null {
  if (!insumos.length || insumos.some(i => !Number.isSafeInteger(i.idInsumo) || i.idInsumo <= 0 || !Number.isFinite(i.cantidadInsumo) || i.cantidadInsumo <= 0)) return null;
  const porcion = insumos.reduce((s, i) => s + i.cantidadInsumo, 0);
  const sum = (key: keyof NonNullable<FormulaInsumo['insumo']>) => insumos.reduce((s, i) => {
    const value = i.insumo?.[key];
    return typeof value === 'number' && Number.isFinite(value) ? s + value * i.cantidadInsumo / 100 : NaN;
  }, 0);
  return {
    id: 0, nombre: 'Composición propia', tipoComposicion: 'producto', porcion, esProtegida: false, insumos,
    kcaloriasPorPorcion: sum('cal_100g'), kjPorPorcion: sum('cal_100g') * 4.184,
    proteinasPorPorcion: sum('proteinas_100g'), carbohidratosPorPorcion: sum('carbohidratos_100g'),
    grasaTotalPorPorcion: sum('grasasTotales_100g'), grasaSaturadaPorPorcion: sum('grasasSaturadas_100g'),
    grasaTransPorPorcion: sum('grasasTrans_100g'), sodioPorPorcion: sum('sodio_100g'), fibraPorPorcion: sum('fibra_100g'),
    otrosPorPorcion: sum('otro_100g'),
  };
}

export function calculatePresentation(form: ProductoFormState, porcion: number): ProductoFormState {
  if (!Number.isFinite(porcion) || porcion <= 0) return { ...form, ...(form.calculationMode === 'porciones' ? { pesoNeto: 0 } : { cantPorcionesAportadas: 0 }) };
  return form.calculationMode === 'porciones'
    ? { ...form, pesoNeto: form.cantPorcionesAportadas * porcion }
    : { ...form, cantPorcionesAportadas: form.pesoNeto / porcion };
}

export function validateProductoForm(form: ProductoFormState, insumos: FormulaInsumo[]) {
  const errors: Record<string, string> = {};
  if (!form.nombreComercial.trim()) errors.nombreComercial = 'El nombre comercial es obligatorio';
  if (form.tipoComposicion === 'formula' && (!Number.isSafeInteger(form.idFormula) || form.idFormula <= 0)) errors.idFormula = 'Seleccioná una fórmula';
  if (form.tipoComposicion === 'insumos') {
    if (!insumos.length) errors.insumos = 'Agregá al menos un insumo para una porción';
    else if (insumos.some(i => !Number.isSafeInteger(i.idInsumo) || i.idInsumo <= 0 || !Number.isFinite(i.cantidadInsumo) || i.cantidadInsumo <= 0)) errors.insumos = 'Cada insumo debe tener una cantidad en gramos mayor a 0';
    else if (new Set(insumos.map(i => i.idInsumo)).size !== insumos.length) errors.insumos = 'No repitas un insumo en la composición';
  }
  if (!Number.isFinite(form.pesoNeto) || form.pesoNeto <= 0) errors.pesoNeto = 'El peso neto debe ser mayor a 0';
  if (!Number.isFinite(form.cantPorcionesAportadas) || form.cantPorcionesAportadas <= 0) errors.cantPorcionesAportadas = 'Las porciones deben ser mayores a 0';
  if (form.diasVencimiento.trim() && (!Number.isSafeInteger(Number(form.diasVencimiento)) || Number(form.diasVencimiento) <= 0)) errors.diasVencimiento = 'Ingresá días enteros mayores a 0';
  return errors;
}

export function productoFormPayload(form: ProductoFormState, insumos: FormulaInsumo[]): CreateProductoRequest {
  return {
    nombreComercial: form.nombreComercial.trim(), sku: form.sku.trim(),
    diasVencimiento: form.diasVencimiento.trim() ? Number(form.diasVencimiento) : null,
    ...(form.tipoComposicion === 'insumos'
      ? { tipoComposicion: 'insumos' as const, insumos: insumos.map(i => ({ idInsumo: i.idInsumo, cantidadInsumo: i.cantidadInsumo })) }
      : { tipoComposicion: 'formula' as const, idFormula: form.idFormula }),
    ...(form.calculationMode === 'porciones' ? { cantPorcionesAportadas: form.cantPorcionesAportadas } : { pesoNeto: form.pesoNeto }),
  };
}
