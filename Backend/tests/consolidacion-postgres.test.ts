import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes } from 'node:crypto';

const destino = new URL(process.env.AIP_TEST_DATABASE_URL ?? 'postgresql://invalid/invalid');
assert.equal(destino.hostname, '127.0.0.1');
assert.equal(destino.port, '55447');
assert.equal(destino.pathname, '/aip_entrega_test');
process.env.DATABASE_URL = destino.toString();
process.env.JWT_SECRET = randomBytes(32).toString('hex');
process.env.N8N_STOCK_WEBHOOK_URL = '';
process.env.NODE_ENV = 'test';
const { prisma } = require('../src/lib/prisma') as typeof import('../src/lib/prisma');
const { ProductosService } = require('../src/services/productos.service') as typeof import('../src/services/productos.service');
const { FormulasService } = require('../src/services/formulas.service') as typeof import('../src/services/formulas.service');
const { PedidosService } = require('../src/services/pedidos.service') as typeof import('../src/services/pedidos.service');
const { buildOrdenExport } = require('../../frontend/src/features/pedidos/utils/ordenExport') as typeof import('../../frontend/src/features/pedidos/utils/ordenExport');
const express = require('express') as typeof import('express');
const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');

test('consolidación sobre PostgreSQL: composición propia, pertenencia e historia de órdenes', async t => {
  const stamp = Date.now();
  const productos = new ProductosService();
  const formulas = new FormulasService();
  const pedidos = new PedidosService();
  const app = express();
  app.use(express.json());
  for (const name of ['auth', 'productos', 'formulas', 'pedidos']) app.use('/' + name, require('../src/routes/' + name + '.routes').default);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(r => server.once('listening', r));
  const address = server.address(); assert.ok(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    const venta = await prisma.perfil.create({ data: { nombre: 'ENCPTOVENTA' } });
    const admin = await prisma.perfil.create({ data: { nombre: 'ADMINFAB' } });
    const mail = `consolidacion-${stamp}@example.invalid`;
    await prisma.usuario.create({ data: { mail, contrasena: 'sin-login-fixture', perfiles: { create: [{ idPerfil: venta.id }, { idPerfil: admin.id }] } } });
    const token = jwt.sign({}, process.env.JWT_SECRET!, { subject: mail });
    const request = (path: string, body?: unknown) => fetch(base + path, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const insumos = [];
    for (let i = 0; i < 2; i++) insumos.push(await prisma.insumo.create({ data: { nombre: `Materia ${i} ${stamp}`, cal_100g: 100 + i * 100, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 10, carbohidratos_100g: 20, sodio_100g: .1, fibra_100g: 2, otro_100g: 0 } }));
    const lineas = [{ idInsumo: insumos[0].id, cantidadInsumo: 10 }, { idInsumo: insumos[1].id, cantidadInsumo: 30 }];
    const producto = await productos.createProducto({ nombreComercial: `Directo ${stamp}`, tipoComposicion: 'insumos', insumos: lineas, cantPorcionesAportadas: 2.5, diasVencimiento: 90 });
    await t.test('producto directo persiste 40g porción y100g envase, nutrición y costo incompleto', async () => {
      assert.equal(producto.pesoNeto, 100); assert.equal(producto.cantPorcionesAportadas, 2.5);
      assert.equal(producto.formula!.porcion, 40); assert.equal(producto.formula!.kcalorias, 70);
      assert.equal(producto.formula!.tipoComposicion, 'producto');
      const propia = await prisma.formula.findUnique({ where: { id: producto.idFormula } });
      assert.equal(propia?.propietarioProductoId, producto.idProducto);
      const costo = await productos.calcularCosto(producto.idProducto);
      assert.equal(costo.costoPorPaquete, null); assert.equal(costo.esParcial, true);
    });
    await t.test('propias no se listan ni se modifican desde la API de fórmulas', async () => {
      assert.ok(!(await formulas.list({})).some(f => f.id === producto.idFormula));
      assert.equal((await request(`/formulas/${producto.idFormula}`)).status, 404);
      await assert.rejects(formulas.updateFormula(producto.idFormula, { nombre: 'Cambiar', insumos: lineas }));
      await assert.rejects(productos.createProducto({ nombreComercial: `Ajeno ${stamp}`, idFormula: producto.idFormula, cantPorcionesAportadas: 1 }));
    });
    await t.test('inválidos revierten toda composición y producto', async () => {
      const cantidad = await prisma.formula.count({ where: { tipoComposicion: 'producto' } });
      for (const lines of [[lineas[0], lineas[0]], [{ ...lineas[0], cantidadInsumo: -1 }], [{ ...lineas[0], cantidadInsumo: Infinity }]]) {
        await assert.rejects(productos.createProducto({ nombreComercial: `Inválido ${stamp}`, tipoComposicion: 'insumos', insumos: lines, cantPorcionesAportadas: 1 }));
      }
      // Falla posterior a crear la composición, provocada por SKU único ya utilizado.
      await prisma.producto.update({ where: { idProducto: producto.idProducto }, data: { sku: `UNIQUE-${stamp}` } });
      await assert.rejects(productos.createProducto({ nombreComercial: `Duplicado SKU ${stamp}`, tipoComposicion: 'insumos', insumos: lineas, cantPorcionesAportadas: 1, sku: `UNIQUE-${stamp}` }));
      assert.equal(await prisma.formula.count({ where: { tipoComposicion: 'producto' } }), cantidad);
    });
    await prisma.estadoPedido.upsert({ where: { nombre: 'Creado' }, create: { nombre: 'Creado' }, update: {} });
    const ordenResponse = await request('/pedidos', { idProducto: producto.idProducto, paquetes: 2, mailUsuarioCreador: 'ajeno@example.invalid', idPerfilCreador: venta.id });
    assert.equal(ordenResponse.status, 201);
    const orden = await ordenResponse.json() as { numPedido: number; productoSnapshot: unknown; idPerfilCreador: number; mailUsuarioCreador: string };
    await t.test('crear orden atribuye actor y perfil permitido reales, guarda copia inmutable', async () => {
      assert.equal(orden.mailUsuarioCreador, mail); assert.equal(orden.idPerfilCreador, admin.id);
      assert.ok(orden.productoSnapshot);
      await assert.rejects(prisma.pedido.update({ where: { numPedido: orden.numPedido }, data: { productoSnapshot: { falsificado: true } } }));
    });
    const nuevasLineas = [{ idInsumo: insumos[0].id, cantidadInsumo: 20 }, { idInsumo: insumos[1].id, cantidadInsumo: 30 }];
    const actualizado = await productos.updateProducto(producto.idProducto, { nombreComercial: `Directo editado ${stamp}`, tipoComposicion: 'insumos', insumos: nuevasLineas, cantPorcionesAportadas: 3 });
    await t.test('edición crea revisión nueva y la orden conserva receta/nutrición/presentación al exportar', async () => {
      assert.notEqual(actualizado.idFormula, producto.idFormula); assert.equal(actualizado.pesoNeto, 150);
      const detalle = await pedidos.detail(orden.numPedido);
      const exported = buildOrdenExport(detalle as never, null);
      assert.equal(exported.formula?.porcion, 40); assert.equal(exported.producto?.pesoNeto, 100);
      assert.equal(exported.producto?.cantPorcionesAportadas, 2.5);
      assert.deepEqual(exported.insumos.map(i => i.cantidad), [50, 150]);
      assert.ok(exported.descripcionComposicion.includes('registradas'));
      assert.equal((await prisma.formula.findUnique({ where: { id: producto.idFormula } }))?.propietarioProductoId, producto.idProducto);
    });
    await t.test('trigger prohíbe compartir composición propia aunque dejó de ser actual', async () => {
      await assert.rejects(prisma.producto.create({ data: { nombreComercial: `Compartido ${stamp}`, idFormula: producto.idFormula, pesoNeto: 100, cantPorcionesAportadas: 2.5 } }));
      await assert.rejects(prisma.formula.update({ where: { id: producto.idFormula }, data: { tipoComposicion: 'reutilizable' } }));
    });
    await t.test('misma composición no duplica revisión y metadatos reutilizable protegida son editables', async () => {
      const repetido = await productos.updateProducto(producto.idProducto, { tipoComposicion: 'insumos', insumos: nuevasLineas, cantPorcionesAportadas: 3 });
      assert.equal(repetido.idFormula, actualizado.idFormula);
      const reutilizable = await formulas.createFormula({ nombre: `Protegida ${stamp}`, esProtegida: false, insumos: lineas });
      assert.ok(reutilizable);
      await prisma.formula.update({ where: { id: reutilizable!.id }, data: { esProtegida: true } });
      const vinculado = await productos.createProducto({ nombreComercial: `Reusable ${stamp}`, idFormula: reutilizable!.id, cantPorcionesAportadas: 1 });
      const editado = await productos.updateProducto(vinculado.idProducto, { sku: `META-${stamp}`, diasVencimiento: 100 });
      assert.equal(editado.sku, `META-${stamp}`); assert.equal(editado.diasVencimiento, 100);
      assert.equal(editado.idFormula, reutilizable!.id);
    });
    await t.test('fórmula reutilizable admite altas concurrentes sin bloqueo de pertenencia', async () => {
      const formulaCompartida = await formulas.createFormula({ nombre: `Compartible ${stamp}`, esProtegida: false, insumos: lineas });
      const creados = await Promise.all(Array.from({ length: 5 }, (_, i) => productos.createProducto({ nombreComercial: `Concurrente ${stamp} ${i}`, idFormula: formulaCompartida!.id, cantPorcionesAportadas: 1 })));
      assert.equal(creados.length, 5);
      assert.ok(creados.every(p => p.idFormula === formulaCompartida!.id));
      assert.equal((await prisma.formula.findUnique({ where: { id: formulaCompartida!.id } }))?.propietarioProductoId, null);
    });
    await t.test('captura rechaza presentación desactualizada y revierte la orden completa', async () => {
      const antes = await prisma.producto.findUniqueOrThrow({ where: { idProducto: producto.idProducto }, include: { formula: true } });
      await productos.updateProducto(producto.idProducto, { pesoNeto: 200 });
      const cantidadAntes = await prisma.pedido.count();
      await assert.rejects(pedidos.repo.createWithEstadoCreado({ idProducto: producto.idProducto, mailUsuarioCreador: mail, idPerfilCreador: admin.id, cantAProducir_gramos: 150, cantAProducir_paquetes: 1, cantAProducir_porciones: 3 }, (await prisma.estadoPedido.findUniqueOrThrow({ where: { nombre: 'Creado' } })).id, antes), /cambió/);
      assert.equal(await prisma.pedido.count(), cantidadAntes);
    });
    await t.test('edición nutricional revierte completa si falla recálculo', async () => {
      const { InsumosService } = require('../src/services/insumos.service');
      const servicio = new InsumosService();
      await servicio.update(insumos[0].id, { cal_100g: 300 });
      const actual = await prisma.producto.findUniqueOrThrow({ where: { idProducto: producto.idProducto }, include: { formula: { include: { formulaInsumos: { include: { insumo: true } } } } } });
      const esperado = actual.formula.formulaInsumos.reduce((n, fi) => n + fi.cantidadInsumo * fi.insumo.cal_100g / 100, 0);
      assert.equal(actual.formula.kcalorias, esperado);
      servicio.recalcularValoresFormula = async () => { throw new Error('Fallo de recálculo simulado'); };
      await assert.rejects(servicio.update(insumos[0].id, { cal_100g: 400 }), /simulado/);
      assert.equal((await prisma.insumo.findUniqueOrThrow({ where: { id: insumos[0].id } })).cal_100g, 300);
    });
    await t.test('cantidades no finitas y desbordadas se rechazan', () => {
      const convertir = (pedidos as any).convertirCantidades.bind(pedidos);
      const presentacion = { pesoNeto: 100, formula: { porcion: 40 } };
      for (const paquetes of [Infinity, NaN, Number.MAX_VALUE]) assert.throws(() => convertir({ paquetes }, presentacion));
    });
    await t.test('finalizar usa peso y porción registrados en la orden', async () => {
      await prisma.deposito.upsert({ where: { nombre: 'Fábrica-Atrás' }, update: {}, create: { nombre: 'Fábrica-Atrás', direccion: 'Prueba', responsable: 'Fixture', capacidadTotal: 10000 } });
      await prisma.estadoPedido.upsert({ where: { nombre: 'EnElaboración' }, create: { nombre: 'EnElaboración' }, update: {} });
      await prisma.estadoPedido.upsert({ where: { nombre: 'ElaboradoYDepositadoEnFábrica' }, create: { nombre: 'ElaboradoYDepositadoEnFábrica' }, update: {} });
      await pedidos.iniciarElaboracion(orden.numPedido, 'Fixture');
      const cerrada = await pedidos.finalizarElaboracion(orden.numPedido, 'Uno', 2, 'Dos', { unidadesPorCaja: 2 });
      assert.equal(cerrada.cantElaborada_gramos, 200); assert.equal(cerrada.cantElaborada_porciones, 5);
    });
  } finally {
    await new Promise<void>(r => server.close(() => r()));
    await prisma.$disconnect();
  }
});
