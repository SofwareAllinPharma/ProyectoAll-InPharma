import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PrismaClient } from '@prisma/client';

// Doble transaccional de servicios, sin conectar a ninguna base real.
const materiales = [
  { id: 1, activo: true, cal_100g: 100, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 10, carbohidratos_100g: 20, sodio_100g: .1, fibra_100g: 2, otro_100g: 3, nombre: 'A' },
  { id: 2, activo: true, cal_100g: 200, grasasTotales_100g: 2, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 20, carbohidratos_100g: 40, sodio_100g: .2, fibra_100g: 4, otro_100g: 6, nombre: 'B' },
];
let formulas: any[] = [];
let productos: any[] = [];
let lineas: any[] = [];
let nextFormula = 1, nextProduct = 1;
const formulaCompleta = (f: any) => f && ({ ...f, formulaInsumos: lineas.filter(l => l.idFormula === f.id).map(l => ({ ...l, insumo: { ...materiales.find(m => m.id === l.idInsumo), precios: [{ precioPorKg: 1000, proveedor: { id: 1, nombre: 'Referencia' } }] } })) });
const productoCompleto = (p: any) => p && ({ ...p, formula: formulaCompleta(formulas.find(f => f.id === p.idFormula)) });
const matches = (f: any, where: any) => !where || Object.entries(where).every(([key, value]: [string, any]) => {
  if (value && typeof value === 'object') {
    if ('not' in value) return f[key] !== value.not;
    if ('equals' in value) return String(f[key]).toLowerCase() === String(value.equals).toLowerCase();
  }
  return f[key] === value;
});
const db: any = {
  $queryRaw: async () => [],
  $executeRaw: async () => 0,
  insumo: { findMany: async ({ where }: any) => materiales.filter(m => where.id.in.includes(m.id) && m.activo) },
  formula: {
    findUnique: async ({ where }: any) => formulaCompleta(formulas.find(f => f.id === where.id)),
    findFirst: async ({ where }: any) => formulaCompleta(formulas.find(f => matches(f, where))),
    findMany: async ({ where }: any) => formulas.filter(f => matches(f, where)).map(formulaCompleta),
    create: async ({ data }: any) => {
      const { formulaInsumos, ...fields } = data;
      const f = { id: nextFormula++, tipoComposicion: 'reutilizable', activo: true, ...fields };
      formulas.push(f);
      for (const l of formulaInsumos?.create ?? []) lineas.push({ ...l, idFormula: f.id });
      return formulaCompleta(f);
    },
    update: async ({ where, data }: any) => Object.assign(formulas.find(f => f.id === where.id), data),
  },
  formulaInsumo: {
    create: async ({ data }: any) => { lineas.push(data); return data; },
    deleteMany: async ({ where }: any) => { lineas = lineas.filter(l => l.idFormula !== where.idFormula); },
  },
  producto: {
    findUnique: async ({ where }: any) => productoCompleto(productos.find(p => p.idProducto === where.idProducto)),
    findFirst: async ({ where }: any) => productoCompleto(productos.find(p => matches(p, where))),
    create: async ({ data }: any) => { const p = { idProducto: nextProduct++, ...data }; productos.push(p); return productoCompleto(p); },
    update: async ({ where, data }: any) => productoCompleto(Object.assign(productos.find(p => p.idProducto === where.idProducto), data)),
    count: async ({ where }: any) => productos.filter(p => matches(p, where)).length,
  },
  $transaction: async (fn: (tx: any) => Promise<unknown>) => {
    const before = structuredClone({ formulas, productos, lineas });
    try { return await fn(db); } catch (e) { ({ formulas, productos, lineas } = before); throw e; }
  },
};
(global as typeof globalThis & { prisma?: PrismaClient }).prisma = db as PrismaClient;
const { ProductosService } = require('../src/services/productos.service') as typeof import('../src/services/productos.service');
const { FormulasService } = require('../src/services/formulas.service') as typeof import('../src/services/formulas.service');
const { validarLineasComposicion } = require('../src/services/composicion') as typeof import('../src/services/composicion');
const composicion = [{ idInsumo: 1, cantidadInsumo: 25 }, { idInsumo: 2, cantidadInsumo: 15 }];

test('producto directo y fórmula comparten nutrición/costo; revisiones propias preservadas', async t => {
  const service = new ProductosService(); const fs = new FormulasService();
  let propio: Awaited<ReturnType<typeof service.createProducto>>;
  let compartida: NonNullable<Awaited<ReturnType<typeof fs.createFormula>>>;
  await t.test('validación rechaza vacíos, duplicados, NaN, negativos e IDs inválidos', async () => {
    for (const valor of [[], [{ idInsumo: 1, cantidadInsumo: 0 }], [{ idInsumo: 1, cantidadInsumo: NaN }], [{ idInsumo: 1.5, cantidadInsumo: 1 }], [{ idInsumo: 1, cantidadInsumo: -1 }], [composicion[0], composicion[0]]]) assert.throws(() => validarLineasComposicion(valor));
    await assert.rejects(service.createProducto({ nombreComercial: 'Inexistente', tipoComposicion: 'insumos', insumos: [{ idInsumo: 99, cantidadInsumo: 1 }], pesoNeto: 40 }));
  });
  await t.test('ambos caminos producen 40g/porción, 55kcal, fracciones y costo coincidente', async () => {
    compartida = (await fs.createFormula({ nombre: 'Reutilizable protegida', esProtegida: true, insumos: composicion }))!;
    propio = await service.createProducto({ nombreComercial: 'Directo', tipoComposicion: 'insumos', insumos: composicion, cantPorcionesAportadas: 2.5 });
    const desdeFormula = await service.createProducto({ nombreComercial: 'Compartido', tipoComposicion: 'formula', idFormula: compartida.id, cantPorcionesAportadas: 2.5 });
    assert.equal(propio.pesoNeto, 100); assert.equal(propio.formula.porcion, 40); assert.equal(propio.formula.kcalorias, 55);
    assert.equal(propio.formula.fibra, compartida.fibra); assert.equal(propio.formula.otros, compartida.otros);
    assert.equal(propio.formula.tipoComposicion, 'producto'); assert.equal(propio.formula.esProtegida, true);
    assert.equal((await service.calcularCosto(propio.idProducto)).costoPorPaquete, (await service.calcularCosto(desdeFormula.idProducto)).costoPorPaquete);
    const editado = await service.updateProducto(desdeFormula.idProducto, { sku: 'SKU-COMP', diasVencimiento: 90 });
    assert.equal(editado.sku, 'SKU-COMP'); assert.equal(editado.idFormula, compartida.id);
  });
  await t.test('metadatos y orden de líneas conservan revisión; cambiar gramos crea nueva', async () => {
    const anterior = structuredClone(propio.formula);
    const igual = await service.updateProducto(propio.idProducto, { tipoComposicion: 'insumos', insumos: [...composicion].reverse(), sku: 'NUEVO' });
    assert.equal(igual.idFormula, anterior.id);
    const editado = await service.updateProducto(propio.idProducto, { tipoComposicion: 'insumos', insumos: [{ idInsumo: 1, cantidadInsumo: 20 }, { idInsumo: 2, cantidadInsumo: 20 }] });
    assert.notEqual(editado.idFormula, anterior.id); assert.equal(editado.formula.kcalorias, 60);
    assert.deepEqual(formulaCompleta(formulas.find(f => f.id === anterior.id)), anterior);
  });
  await t.test('composición propia no se lista, presta ni edita/elimina/clona vía fórmula', async () => {
    assert.ok((await fs.list({})).every(f => f.tipoComposicion === 'reutilizable'));
    assert.equal(await fs.detail(propio.idFormula), undefined);
    await assert.rejects(fs.updateFormula(propio.idFormula, { nombre: 'No', insumos: composicion }));
    await assert.rejects(fs.softDeleteFormula(propio.idFormula));
    await assert.rejects(fs.cloneFormula(propio.idFormula, {}));
    await assert.rejects(service.createProducto({ nombreComercial: 'Prestado', tipoComposicion: 'formula', idFormula: propio.idFormula, pesoNeto: 100 }));
    await assert.rejects(service.createProducto({ nombreComercial: 'Ambiguo', tipoComposicion: 'insumos', idFormula: compartida.id, insumos: composicion, pesoNeto: 100 }));
  });
  await t.test('fallo de presentación revierte también la composición, sin huérfano', async () => {
    const antes = formulas.length;
    await assert.rejects(service.createProducto({ nombreComercial: 'Fallido', tipoComposicion: 'insumos', insumos: composicion, pesoNeto: Infinity }));
    assert.equal(formulas.length, antes);
  });
});
