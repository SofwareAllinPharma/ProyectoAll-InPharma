import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { FormulaInsumo } from '../src/features/formulas/types/formula.types';
import type { Producto } from '../src/features/productos/types/producto.types';
import { directComposition, calculatePresentation, initialProductoForm, productoFormPayload, validateProductoForm } from '../src/features/productos/lib/composition';
import { fromApi } from '../src/features/formulas/lib/mappers';

const insumo = { id: 1, nombre: 'Insumo sintético', cal_100g: 100, grasasTotales_100g: 2, grasasTrans_100g: 0, grasasSaturadas_100g: 1, proteinas_100g: 10, carbohidratos_100g: 20, sodio_100g: 0.1, fibra_100g: 3, otro_100g: 4, activo: true };
const lineas: FormulaInsumo[] = [{ idFormula: 0, idInsumo: 1, cantidadInsumo: 40, insumo }];

test('directo: una porción de 40g y 2.5 porciones dan 100g, sin exigir idFormula', () => {
  const formula = directComposition(lineas)!;
  assert.equal(formula.porcion, 40);
  assert.equal(formula.proteinasPorPorcion, 4);
  assert.equal(formula.kcaloriasPorPorcion, 40);
  const form = calculatePresentation({ ...initialProductoForm(), tipoComposicion: 'insumos', nombreComercial: 'Producto directo', calculationMode: 'porciones', cantPorcionesAportadas: 2.5 }, formula.porcion);
  assert.equal(form.pesoNeto, 100);
  assert.deepEqual(validateProductoForm(form, lineas), {});
  const payload = productoFormPayload(form, lineas);
  assert.equal(payload.tipoComposicion, 'insumos');
  assert.equal(payload.idFormula, undefined);
  assert.deepEqual(payload.insumos, [{ idInsumo: 1, cantidadInsumo: 40 }]);
  assert.equal(payload.cantPorcionesAportadas, 2.5);
});
test('fórmula reutilizable: peso se traduce a porciones fraccionarias y no envía líneas', () => {
  const form = calculatePresentation({ ...initialProductoForm(), nombreComercial: 'Con fórmula', idFormula: 8, pesoNeto: 100 }, 40);
  assert.equal(form.cantPorcionesAportadas, 2.5);
  const payload = productoFormPayload(form, lineas);
  assert.equal(payload.idFormula, 8);
  assert.equal(payload.insumos, undefined);
  assert.equal(payload.tipoComposicion, 'formula');
});
test('validación rechaza líneas vacías/repetidas, cantidades inválidas y días fraccionarios', () => {
  const form = { ...initialProductoForm(), tipoComposicion: 'insumos' as const, nombreComercial: 'Válido', cantPorcionesAportadas: 2.5, pesoNeto: 100 };
  assert.ok(validateProductoForm(form, []).insumos);
  assert.ok(validateProductoForm(form, [...lineas, ...lineas]).insumos);
  for (const cantidadInsumo of [0, -1, NaN, Infinity]) assert.ok(validateProductoForm(form, [{ ...lineas[0], cantidadInsumo }]).insumos);
  assert.ok(validateProductoForm({ ...form, diasVencimiento: '2.5' }, lineas).diasVencimiento);
  assert.ok(validateProductoForm({ ...form, cantPorcionesAportadas: Infinity }, lineas).cantPorcionesAportadas);
});
test('ficha desconocida no produce nutrición inventada; editar propia restaura modo directo', () => {
  const desconocido = directComposition([{ ...lineas[0], insumo: undefined }])!;
  assert.ok(Number.isNaN(desconocido.proteinasPorPorcion));
  const producto: Producto = { idProducto: 5, idFormula: 99, nombreComercial: 'Directo existente', pesoNeto: 100, cantPorcionesAportadas: 2.5, estaActivo: true, formula: { ...directComposition(lineas)!, id: 99 } };
  const form = initialProductoForm(producto);
  assert.equal(form.tipoComposicion, 'insumos');
  assert.equal(form.calculationMode, 'porciones');
  assert.equal(productoFormPayload(form, lineas).idFormula, undefined);
});
test('mapper conserva composición propia desde contrato API', () => {
  const formula = fromApi({ id: 99, tipoComposicion: 'producto', formulaInsumos: [{ id: 1, idFormula: 99, ...lineas[0] }] } as never);
  assert.equal(formula.tipoComposicion, 'producto');
  assert.equal(formula.insumos?.[0].cantidadInsumo, 40);
});
