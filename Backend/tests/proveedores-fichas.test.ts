import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';

const referencia = { id: 1, activo: true, precioPorKg: 1000, insumo: { id: 3, nombre: 'Insumo de prueba', activo: true } };
let consultas = 0;
const db = {
  proveedor: {
    findUnique: async ({ where, include }: { where: { id: number }; include?: unknown }) => {
      consultas++;
      if (where.id !== 1) return null;
      return { id: 1, nombre: 'Proveedor de prueba', activo: true, ...(include ? { precios: [referencia, { ...referencia, id: 2, activo: false }] } : {}) };
    },
    findMany: async () => [{ id: 1, nombre: 'Proveedor de prueba', activo: true }],
  },
};
(global as typeof globalThis & { prisma?: PrismaClient }).prisma = db as unknown as PrismaClient;
process.env.JWT_SECRET = randomBytes(32).toString('hex');
const { ProveedoresService } = require('../src/services/proveedores.service') as typeof import('../src/services/proveedores.service');
const router = require('../src/routes/proveedores.routes').default;
const { fromApi } = require('../../frontend/src/features/formulas/lib/mappers') as typeof import('../../frontend/src/features/formulas/lib/mappers');
const { computeNutrition } = require('../../frontend/src/features/productos/hooks/useNutrition') as typeof import('../../frontend/src/features/productos/hooks/useNutrition');

test('ficha de proveedor conserva referencias vigentes e históricas sin filtrarlas de la lista pública', async () => {
  const service = new ProveedoresService();
  assert.equal('precios' in (await service.list())[0], false);
  const detalle = await service.detail(1);
  assert.equal(detalle.precios.filter(p => p.activo).length, 1);
  assert.equal(detalle.precios.filter(p => !p.activo).length, 1);
  const antes = consultas;
  for (const id of [0, -1, 1.5, NaN]) await assert.rejects(service.detail(id), /inválido/);
  assert.equal(consultas, antes);
  await assert.rejects(service.detail(99), /no encontrado/);
});

test('el gate real de la ruta de ficha admite administradores y rechaza técnico/no autenticado', async () => {
  const route = router.stack.find((layer: { route?: { path: string } }) => layer.route?.path === '/:id').route;
  const gate = route.stack[0].handle;
  for (const [roles, esperado] of [[['ADMINSIS'], 200], [['ADMINFAB'], 200], [['TECNICO'], 403], [[], 403]] as const) {
    let status = 200;
    let allowed = false;
    await gate({ user: { mail: 'sintetico@example.invalid' }, roles: [...roles] }, { status(code: number) { status = code; return this; }, json() {} }, () => { allowed = true; });
    assert.equal(status, esperado);
    assert.equal(allowed, esperado === 200);
  }
  let status = 200;
  await gate({}, { status(code: number) { status = code; return this; }, json() {} }, () => assert.fail('No debe autorizar'));
  assert.equal(status, 401);
});

test('otros conserva valor fuente por porción/100g/envase y no inventa cero si falta', () => {
  const apiFormula = { id: 1, nombre: 'Fórmula prueba', porcion: 40, kcalorias: 100, kjuls: 418.4, proteinas: 2, carbohidratos: 10, grasaTotal: 1, grasaTrans: 0, grasaSaturada: 0.5, fibra: 3, sodio: 0.01, otros: 2, esProtegida: false, activo: true };
  const formula = fromApi(apiFormula);
  const producto = { idProducto: 1, idFormula: 1, nombreComercial: 'Producto prueba', pesoNeto: 100, cantPorcionesAportadas: 2.5, estaActivo: true, formula };
  const valor = computeNutrition(producto);
  assert.equal(valor.nutritionPerPortion.otros, 2);
  assert.equal(valor.nutritionPer100g.otros, 5);
  assert.equal(valor.nutritionTotal.otros, 5);
  assert.equal(valor.nutritionPerPortion.fibra, 3);
  formula.otrosPorPorcion = null;
  const faltante = computeNutrition(producto);
  assert.equal(faltante.nutritionTotal.otros, null);
  assert.equal(faltante.rowsPerPortion.find(r => r.label === 'Otros')?.value, 'No disponible');
  assert.equal(faltante.rowsPer100g.find(r => r.label === 'Otros')?.value, 'No disponible');
});
