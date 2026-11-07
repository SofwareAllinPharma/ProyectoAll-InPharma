import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PrismaClient } from '@prisma/client';

// Doble en memoria: nunca se crea un cliente ni se abre una conexión PostgreSQL.
const proveedores = [{ id: 1, nombre: 'Proveedor A', activo: true }, { id: 2, nombre: 'Proveedor B', activo: true }];
const insumos = [{ id: 1, nombre: 'Insumo A', activo: true }, { id: 2, nombre: 'Insumo B', activo: true }];
type Precio = { id: number; idInsumo: number; idProveedor: number; precioPorKg: number; activo: boolean; fechaDesde: Date; fechaHasta?: Date; observacion: string | null };
const precios: Precio[] = [];
let lineas = [{ idInsumo: 1, cantidadInsumo: 100 }, { idInsumo: 2, cantidadInsumo: 50 }];
const formula = () => ({ formulaInsumos: lineas.map(fi => ({ ...fi, insumo: { ...insumos.find(i => i.id === fi.idInsumo)!, precios: precios.filter(p => p.idInsumo === fi.idInsumo && p.activo).map(p => ({ ...p, proveedor: proveedores.find(v => v.id === p.idProveedor) })) } })) });
const db = {
  $queryRaw: async () => [],
  insumo: { findUnique: async ({ where }: { where: { id: number } }) => insumos.find(i => i.id === where.id) },
  proveedor: { findUnique: async ({ where }: { where: { id: number } }) => proveedores.find(p => p.id === where.id) },
  precioInsumo: {
    updateMany: async ({ where, data }: { where: { idInsumo: number }; data: Partial<Precio> }) => { precios.filter(p => p.idInsumo === where.idInsumo && p.activo).forEach(p => Object.assign(p, data)); },
    create: async ({ data }: { data: Omit<Precio, 'id'> }) => { const p = { id: precios.length + 1, ...data }; precios.push(p); return p; },
    findMany: async ({ where }: { where: { idInsumo: number } }) => precios.filter(p => p.idInsumo === where.idInsumo),
  },
  formula: { findUnique: async () => formula() },
  producto: { findUnique: async () => ({ idProducto: 1, estaActivo: true, nombreComercial: 'Producto sintético', cantPorcionesAportadas: 2.5, formula: formula() }) },
  $transaction: async (callback: (tx: unknown) => unknown) => callback(db),
};
(global as typeof globalThis & { prisma?: PrismaClient }).prisma = db as unknown as PrismaClient;
const { PreciosInsumoService } = require('../src/services/preciosInsumo.service') as typeof import('../src/services/preciosInsumo.service');
const { FormulasService } = require('../src/services/formulas.service') as typeof import('../src/services/formulas.service');
const { ProductosService } = require('../src/services/productos.service') as typeof import('../src/services/productos.service');
const { ProductosController } = require('../src/controllers/productos.controller') as typeof import('../src/controllers/productos.controller');

test('precio de referencia → historial → fórmula → producto sin convertir faltantes en cero', async t => {
  const precio = new PreciosInsumoService();
  const formulas = new FormulasService();
  const productos = new ProductosService();
  await t.test('sin precios: total desconocido y dos faltantes', async () => {
    const f = await formulas.calcularCosto(1);
    assert.equal(f.costoPorPorcion, null);
    assert.equal(f.esParcial, true);
    assert.deepEqual(f.insumosSinPrecio, ['Insumo A', 'Insumo B']);
    assert.equal((await productos.calcularCosto(1)).costoPorPaquete, null);
  });
  await t.test('rechaza precio no positivo, no finito y proveedor inexistente', async () => {
    for (const valor of [0, -1, NaN, Infinity]) await assert.rejects(precio.setNuevoPrecio(1, { idProveedor: 1, precioPorKg: valor }));
    await assert.rejects(precio.setNuevoPrecio(1, { idProveedor: 999, precioPorKg: 1000 }));
    assert.equal(precios.length, 0);
  });
  await t.test('carga parcial conserva aporte conocido pero no total', async () => {
    await precio.setNuevoPrecio(1, { idProveedor: 1, precioPorKg: 1000 });
    const f = await formulas.calcularCosto(1);
    assert.equal(f.costoPorPorcion, null);
    assert.equal(f.detalle[0].costoAporte, 100);
    assert.deepEqual(f.insumosSinPrecio, ['Insumo B']);
    assert.equal((await productos.calcularCosto(1)).costoPorPaquete, null);
  });
  await t.test('100g × 1000/kg + 50g × 2000/kg = 200 por porción, 500 por 2.5 porciones', async () => {
    await precio.setNuevoPrecio(2, { idProveedor: 1, precioPorKg: 2000 });
    assert.equal((await formulas.calcularCosto(1)).costoPorPorcion, 200);
    const p = await productos.calcularCosto(1);
    assert.equal(p.costoPorPaquete, 500);
    assert.equal(p.esParcial, false);
  });
  await t.test('cambiar proveedor cierra precio anterior y conserva historia', async () => {
    await precio.setNuevoPrecio(1, { idProveedor: 2, precioPorKg: 1500 });
    const historia = await precio.listByInsumo(1);
    assert.equal(historia.length, 2);
    assert.equal(historia.filter(p => p.activo).length, 1);
    assert.equal(precios[0].activo, false);
    assert.ok(precios[0].fechaHasta);
    assert.equal((await productos.calcularCosto(1)).costoPorPaquete, 625);
    await assert.rejects(precio.deletePrecio(1, precios[0].id), /historial/);
    assert.equal(precios.length, 3);
  });
  await t.test('controlador serializa null para fórmula sin líneas', async () => {
    lineas = [];
    assert.equal((await formulas.calcularCosto(1)).costoPorPorcion, null);
    let body: unknown;
    const res = { json: (value: unknown) => { body = value; }, status: () => { throw new Error('No debe fallar'); } };
    await new ProductosController().costo({ params: { id: '1' } } as never, res as never);
    const serializado = JSON.parse(JSON.stringify(body));
    assert.equal(serializado.costoPorPorcion, null);
    assert.equal(serializado.costoPorPaquete, null);
    assert.equal(serializado.esParcial, true);
  });
});
