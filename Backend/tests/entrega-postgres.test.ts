import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

// Fail closed antes de importar Prisma/rutas: nunca usa DATABASE_URL del proyecto.
const destino = new URL(process.env.AIP_TEST_DATABASE_URL ?? 'postgresql://invalid/invalid');
assert.equal(destino.hostname, '127.0.0.1');
assert.equal(destino.port, '55447');
assert.equal(destino.pathname, '/aip_entrega_test');
process.env.DATABASE_URL = destino.toString();
process.env.JWT_SECRET = randomBytes(32).toString('hex');
process.env.N8N_STOCK_WEBHOOK_URL = '';
process.env.NODE_ENV = 'test';
const { prisma } = require('../src/lib/prisma') as typeof import('../src/lib/prisma');
const { LotesService } = require('../src/services/lotes.service') as typeof import('../src/services/lotes.service');
const { PreciosInsumoService } = require('../src/services/preciosInsumo.service') as typeof import('../src/services/preciosInsumo.service');
const { PedidosService } = require('../src/services/pedidos.service') as typeof import('../src/services/pedidos.service');
const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');
const express = require('express') as typeof import('express');
const stamp = Date.now();

test('entrega AIP sobre PostgreSQL temporal: stock, producción, precios y permisos HTTP', async t => {
  const stock = new LotesService();
  const precios = new PreciosInsumoService();
  const pedidos = new PedidosService();
  const app = express();
  app.use(express.json());
  for (const [path, name] of [['lotes', 'lotes'], ['proveedores', 'proveedores'], ['insumos', 'insumos'], ['formulas', 'formulas'], ['productos', 'productos'], ['pedidos', 'pedidos'], ['inventario', 'inventario'], ['inventario-global', 'inventarioGlobal'], ['movimientos', 'movimiento']]) {
    app.use('/' + path, require('../src/routes/' + name + '.routes').default);
  }
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(r => server.once('listening', r));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}`;
  const tokens: Record<string, string> = {};
  const perfiles: Record<string, number> = {};
  try {
    for (const role of ['ADMINSIS', 'ADMINFAB', 'TECNICO', 'ENCPTOVENTA']) {
      const mail = `aip-test-${role}-${stamp}@example.invalid`;
      const perfil = await prisma.perfil.create({ data: { nombre: role } });
      await prisma.usuario.create({ data: { mail, contrasena: 'no-login-test-only', perfiles: { create: { idPerfil: perfil.id } } } });
      perfiles[role] = perfil.id;
      tokens[role] = jwt.sign({}, process.env.JWT_SECRET!, { subject: mail, expiresIn: '1h' });
    }
    const dep = async (nombre: string) => prisma.deposito.upsert({ where: { nombre }, update: {}, create: { nombre, direccion: 'Fixture local', responsable: 'Prueba', capacidadTotal: 100000 } });
    const atras = await dep('Fábrica-Atrás'); const intermedio = await dep('Intermedio'); const venta = await dep('Estantería');
    const insumo = await prisma.insumo.create({ data: { nombre: `Insumo sintético ${stamp}`, cal_100g: 100, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 10, carbohidratos_100g: 20, sodio_100g: 0.1, fibra_100g: 1, otro_100g: 0 } });
    const formula = await prisma.formula.create({ data: { nombre: `Fórmula sintética ${stamp}`, porcion: 40, kcalorias: 40, kjuls: 167.36, grasaTotal: .4, grasaTrans: 0, grasaSaturada: 0, proteinas: 4, carbohidratos: 8, sodio: .04, fibra: .4, otros: 0, esProtegida: false, formulaInsumos: { create: { idInsumo: insumo.id, cantidadInsumo: 40 } } } });
    const producto = await prisma.producto.create({ data: { nombreComercial: `Producto sintético ${stamp}`, idFormula: formula.id, pesoNeto: 200, cantPorcionesAportadas: 5, diasVencimiento: 90, sku: `TEST-${stamp}` } });
    const proveedor = await prisma.proveedor.create({ data: { nombre: `Proveedor sintético ${stamp}` } });
    const request = (path: string, role: string, body?: unknown) => fetch(base + path, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + tokens[role], 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    await t.test('precio vigente único incluso con diez cargas concurrentes, historia intacta', async () => {
      await Promise.all(Array.from({ length: 10 }, (_, i) => precios.setNuevoPrecio(insumo.id, { idProveedor: proveedor.id, precioPorKg: 1000 + i })));
      assert.equal(await prisma.precioInsumo.count({ where: { idInsumo: insumo.id } }), 10);
      assert.equal(await prisma.precioInsumo.count({ where: { idInsumo: insumo.id, activo: true } }), 1);
    });
    await t.test('costo faltante y completo por HTTP, permisos de precios/proveedores', async () => {
      assert.equal((await fetch(base + '/lotes')).status, 401);
      assert.equal((await request(`/insumos/${insumo.id}/precios`, 'TECNICO')).status, 403);
      assert.equal((await request(`/proveedores/${proveedor.id}`, 'TECNICO')).status, 403);
      assert.equal((await request(`/proveedores/${proveedor.id}`, 'ADMINFAB')).status, 200);
      const costo = await (await request(`/productos/${producto.idProducto}/costo`, 'ADMINFAB')).json() as { costoPorPaquete: number; esParcial: boolean };
      assert.equal(costo.esParcial, false); assert.ok(costo.costoPorPaquete > 0);
      await prisma.precioInsumo.updateMany({ where: { idInsumo: insumo.id }, data: { activo: false } });
      const faltante = await (await request(`/formulas/${formula.id}/costo`, 'TECNICO')).json() as { costoPorPorcion: number | null; esParcial: boolean };
      assert.equal(faltante.costoPorPorcion, null); assert.equal(faltante.esParcial, true);
      await precios.setNuevoPrecio(insumo.id, { idProveedor: proveedor.id, precioPorKg: 1000 });
    });
    const pedido = await prisma.pedido.create({ data: { idProducto: producto.idProducto, mailUsuarioCreador: `aip-test-ADMINFAB-${stamp}@example.invalid`, idPerfilCreador: perfiles.ADMINFAB, cantAProducir_gramos: 5000, cantAProducir_paquetes: 25, cantAProducir_porciones: 125 } });
    const enElab = await prisma.estadoPedido.upsert({ where: { nombre: 'EnElaboración' }, create: { nombre: 'EnElaboración' }, update: {} });
    await prisma.estadoPedido.upsert({ where: { nombre: 'ElaboradoYDepositadoEnFábrica' }, create: { nombre: 'ElaboradoYDepositadoEnFábrica' }, update: {} });
    const cambio = await prisma.cambioEstadoPedido.create({ data: { idPedido: pedido.numPedido, idEstadoPedido: enElab.id, fechaHoraInicio: new Date() } });
    await prisma.pedido.update({ where: { numPedido: pedido.numPedido }, data: { idCambioEstadoPedido: cambio.idCambioEstado } });
    await t.test('cierre rechaza legacy, responsables iguales y paquetes fraccionarios sin escribir', async () => {
      await assert.rejects(pedidos.finalizarElaboracion(pedido.numPedido, 'Elabora', 25));
      await assert.rejects(pedidos.finalizarElaboracion(pedido.numPedido, 'Elabora', 25, 'Elabora', { unidadesPorCaja: 10 }));
      await assert.rejects(pedidos.finalizarElaboracion(pedido.numPedido, 'Elabora', 25.5, 'Deposita', { unidadesPorCaja: 10 }));
      assert.equal(await prisma.lote.count({ where: { idPedido: pedido.numPedido } }), 0);
    });
    await t.test('finalizar doble concurrente crea exactamente un lote de 25, sin tocar saldo legacy', async () => {
      const results = await Promise.allSettled([1, 2].map(() => pedidos.finalizarElaboracion(pedido.numPedido, 'Elabora', 25, 'Deposita', { unidadesPorCaja: 10 })));
      assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
      assert.equal(await prisma.lote.count({ where: { idPedido: pedido.numPedido } }), 1);
      const cajas = await prisma.caja.findMany({ where: { lote: { idPedido: pedido.numPedido } }, orderBy: { id: 'asc' } });
      assert.deepEqual(cajas.map(c => c.unidades), [10, 10, 5]);
      assert.ok(cajas.every(c => c.idDeposito === atras.id));
      assert.equal(await prisma.inventario.count({ where: { idProducto: producto.idProducto } }), 0);
    });
    await t.test('Atrás → Intermedio → Estantería → venta de 3: saldos 5/10/7', async () => {
      const mover = (origen: number, destino: number, cantidadCajas: number) => stock.trasladar({ idDepositoOrigen: origen, idDepositoDestino: destino, idProducto: producto.idProducto, cantidadCajas, responsableEnvio: 'Uno', responsableRecepcion: 'Dos' });
      await mover(atras.id, intermedio.id, 2); await mover(intermedio.id, venta.id, 1);
      await stock.egresar({ idDeposito: venta.id, idProducto: producto.idProducto, unidades: 3, motivo: 'VENTA_MOSTRADOR' });
      for (const [deposito, esperado] of [[atras.id, 5], [intermedio.id, 10], [venta.id, 7]]) {
        const rows = await stock.stockPorDeposito(deposito);
        assert.equal(rows.find(p => p.idProducto === producto.idProducto)?.totalUnidades, esperado);
      }
    });
    await t.test('venta solo Estantería; ajustes permitidos; rechaza fracciones y motivos desconocidos', async () => {
      for (const origen of [atras.id, intermedio.id]) await assert.rejects(stock.egresar({ idDeposito: origen, idProducto: producto.idProducto, unidades: 1, motivo: 'VENTA_MOSTRADOR' }), /Estantería/);
      for (const unidades of [1.5, -1, NaN]) await assert.rejects(stock.egresar({ idDeposito: venta.id, idProducto: producto.idProducto, unidades }));
      await assert.rejects(stock.egresar({ idDeposito: atras.id, idProducto: producto.idProducto, unidades: 1, motivo: 'cualquier-cosa' }));
      await stock.egresar({ idDeposito: atras.id, idProducto: producto.idProducto, unidades: 1, motivo: 'AJUSTE' });
    });
    await t.test('ventas concurrentes no sobrevenden; alerta incluye cero y no usa cantidad legacy', async () => {
      const results = await Promise.allSettled([1, 2].map(() => stock.egresar({ idDeposito: venta.id, idProducto: producto.idProducto, unidades: 5 })));
      assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
      await stock.egresar({ idDeposito: venta.id, idProducto: producto.idProducto, unidades: 2 });
      await prisma.inventario.create({ data: { idDeposito: venta.id, idProducto: producto.idProducto, cantidadProducto: 999, umbralMin: 3 } });
      const alerta = (await stock.alertasPorDeposito(venta.id)).find(p => p.idProducto === producto.idProducto);
      assert.equal(alerta?.cantidadProducto, 0); assert.equal(alerta?.estado, 'CRITICO');
      assert.equal((await prisma.inventario.findUnique({ where: { idDeposito_idProducto: { idDeposito: venta.id, idProducto: producto.idProducto } } }))?.cantidadProducto, 999);
    });
    await t.test('dos traslados concurrentes de una caja no generan doble movimiento', async () => {
      const count = await prisma.movimientoCaja.count({ where: { caja: { lote: { idProducto: producto.idProducto } } } });
      const results = await Promise.allSettled([1, 2].map(() => stock.trasladar({ idDepositoOrigen: intermedio.id, idDepositoDestino: venta.id, idProducto: producto.idProducto, cantidadCajas: 1, responsableEnvio: 'Uno', responsableRecepcion: 'Dos' })));
      assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
      assert.equal(await prisma.movimientoCaja.count({ where: { caja: { lote: { idProducto: producto.idProducto } } } }), count + 1);
    });
    await t.test('lecturas de depósito/global usan cajas y movimientos anteriores no escriben', async () => {
      const response = await request(`/inventario/${venta.id}`, 'ADMINFAB');
      const rows = await response.json() as Array<{ idProducto: number; cantidadProducto: number }>;
      assert.equal(rows.find(r => r.idProducto === producto.idProducto)?.cantidadProducto, 10);
      const global = await (await request('/inventario-global', 'ADMINFAB')).json() as Array<{ idProducto: number; stockTotal: number }>;
      assert.equal(global.find(r => r.idProducto === producto.idProducto)?.stockTotal, 14);
      const blocked = await fetch(base + '/movimientos', { method: 'PUT', headers: { Authorization: 'Bearer ' + tokens.ADMINFAB, 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal(blocked.status, 409);
      assert.equal((await request('/lotes/movimientos/recientes', 'ENCPTOVENTA')).status, 200);
    });
    await t.test('finalizaciones de dos órdenes distintas generan números de lote diferentes', async () => {
      const nuevas = [];
      for (let i = 0; i < 2; i++) {
        const p = await prisma.pedido.create({ data: { idProducto: producto.idProducto, mailUsuarioCreador: pedido.mailUsuarioCreador, idPerfilCreador: perfiles.ADMINFAB, cantAProducir_gramos: 200, cantAProducir_paquetes: 1, cantAProducir_porciones: 5 } });
        const c = await prisma.cambioEstadoPedido.create({ data: { idPedido: p.numPedido, idEstadoPedido: enElab.id, fechaHoraInicio: new Date() } });
        await prisma.pedido.update({ where: { numPedido: p.numPedido }, data: { idCambioEstadoPedido: c.idCambioEstado } });
        nuevas.push(p);
      }
      await Promise.all(nuevas.map(p => pedidos.finalizarElaboracion(p.numPedido, 'Elabora', 1, 'Deposita', { unidadesPorCaja: 1 })));
      const lotes = await prisma.lote.findMany({ where: { idPedido: { in: nuevas.map(p => p.numPedido) } } });
      assert.equal(lotes.length, 2);
      assert.equal(new Set(lotes.map(l => l.numeroLote)).size, 2);
    });
    await t.test('producto con porciones fraccionarias persiste y mantiene costo coherente', async () => {
      const { ProductosService } = require('../src/services/productos.service') as typeof import('../src/services/productos.service');
      const service = new ProductosService();
      const fraccionario = await service.createProducto({ nombreComercial: `Fraccionario ${stamp}`, idFormula: formula.id, pesoNeto: 100 });
      assert.equal(fraccionario.cantPorcionesAportadas, 2.5);
      assert.equal((await prisma.producto.findUnique({ where: { idProducto: fraccionario.idProducto } }))?.cantPorcionesAportadas, 2.5);
      assert.equal((await service.calcularCosto(fraccionario.idProducto)).costoPorPaquete, 100);
    });
    await t.test('cancelación con lectura anterior al cierre no cancela una orden ya producida', async () => {
      const cancelado = await prisma.estadoPedido.upsert({ where: { nombre: 'Cancelado' }, create: { nombre: 'Cancelado' }, update: {} });
      const service = new PedidosService();
      const real = await service.detail(pedido.numPedido);
      service.detail = async () => ({ ...real, cambioActual: { ...real.cambioActual!, estado: enElab } });
      await assert.rejects(service.cancelar(pedido.numPedido, 'Tardío'), /estado.*cambió/);
      assert.notEqual((await prisma.pedido.findUnique({ where: { numPedido: pedido.numPedido }, include: { cambioActual: true } }))?.cambioActual?.idEstadoPedido, cancelado.id);
      assert.equal(await prisma.lote.count({ where: { idPedido: pedido.numPedido } }), 1);
    });
    await t.test('vencidos físicos: traslado interno permitido, entrada a Estantería y ventas bloqueadas', async () => {
      const productoVto = await prisma.producto.create({ data: { nombreComercial: `Vencimientos ${stamp}`, idFormula: formula.id, pesoNeto: 200, cantPorcionesAportadas: 5, sku: `VTO-${stamp}` } });
      const vencido = await prisma.lote.create({ data: { numeroLote: `EXP-${stamp}`, idProducto: productoVto.idProducto, fechaElaboracion: new Date(Date.now() - 172800000), fechaVencimiento: new Date(Date.now() - 86400000), cajas: { create: { idDeposito: atras.id, unidades: 5 } } }, include: { cajas: true } });
      const caja = vencido.cajas[0];
      const mover = (origen: number, destino: number) => stock.trasladar({ idDepositoOrigen: origen, idDepositoDestino: destino, idProducto: productoVto.idProducto, cantidadCajas: 1, responsableEnvio: 'Uno', responsableRecepcion: 'Dos' });
      const fisico = (await stock.stockPorDeposito(atras.id)).find(p => p.idProducto === productoVto.idProducto)!;
      assert.equal(fisico.totalUnidades, 5); assert.equal(fisico.unidadesVencidas, 5); assert.equal(fisico.unidadesVigentes, 0);
      await mover(atras.id, intermedio.id);
      const movimientosAntes = await prisma.movimientoCaja.count({ where: { idCaja: caja.id } });
      await assert.rejects(mover(intermedio.id, venta.id), /vigentes.*Estantería/);
      assert.equal(await prisma.movimientoCaja.count({ where: { idCaja: caja.id } }), movimientosAntes);
      assert.equal((await prisma.caja.findUnique({ where: { id: caja.id } }))?.idDeposito, intermedio.id);
      // Fixture de un vencido que ya estaba en Estantería antes de aplicar la regla.
      await prisma.caja.update({ where: { id: caja.id }, data: { idDeposito: venta.id } });
      for (const motivo of ['VENTA', 'VENTA_MOSTRADOR', 'VENTA_WEB']) await assert.rejects(stock.egresar({ idDeposito: venta.id, idProducto: productoVto.idProducto, unidades: 1, motivo }), /vigente.*insuficiente/);
      await assert.rejects(stock.procesarVentaWoo({ orderId: `expired-${stamp}`, items: [{ sku: productoVto.sku!, unidades: 1 }] }), /vigente.*insuficiente/);
      assert.equal(await prisma.wooOrderProcesada.count({ where: { orderId: `expired-${stamp}` } }), 0);
      await stock.egresar({ idDeposito: venta.id, idProducto: productoVto.idProducto, unidades: 2, motivo: 'AJUSTE' });
      assert.equal((await prisma.caja.findUnique({ where: { id: caja.id } }))?.unidades, 3);
      // Se puede retirar físicamente de Estantería hacia otro depósito.
      await mover(venta.id, intermedio.id);
      const vigente = await prisma.lote.create({ data: { numeroLote: `VALID-${stamp}`, idProducto: productoVto.idProducto, fechaVencimiento: new Date(Date.now() + 86400000), cajas: { create: { idDeposito: intermedio.id, unidades: 10 } } }, include: { cajas: true } });
      await mover(intermedio.id, venta.id);
      assert.equal((await prisma.caja.findUnique({ where: { id: caja.id } }))?.idDeposito, intermedio.id);
      assert.equal((await prisma.caja.findUnique({ where: { id: vigente.cajas[0].id } }))?.idDeposito, venta.id);
      // Mezcla de físico vencido + vigente: venta usa solo vigente, conservando FIFO entre habilitados.
      await prisma.caja.update({ where: { id: caja.id }, data: { idDeposito: venta.id } });
      await stock.egresar({ idDeposito: venta.id, idProducto: productoVto.idProducto, unidades: 4, motivo: 'VENTA_MOSTRADOR' });
      assert.equal((await prisma.caja.findUnique({ where: { id: caja.id } }))?.unidades, 3);
      assert.equal((await prisma.caja.findUnique({ where: { id: vigente.cajas[0].id } }))?.unidades, 6);
      const mixto = (await stock.stockPorDeposito(venta.id)).find(p => p.idProducto === productoVto.idProducto)!;
      assert.equal(mixto.totalUnidades, 9); assert.equal(mixto.unidadesVigentes, 6); assert.equal(mixto.unidadesVencidas, 3);
      let publicado: { productos: Array<{ sku: string; unidades: number }> } | undefined;
      app.post('/test-stock-hook', (req, res) => { publicado = req.body; res.json({ ok: true }); });
      process.env.N8N_STOCK_WEBHOOK_URL = base + '/test-stock-hook';
      try {
        await (stock as unknown as { notificarSiEstanteria(id: number, productos: number[]): Promise<void> }).notificarSiEstanteria(venta.id, [productoVto.idProducto]);
        assert.equal(publicado?.productos[0].unidades, 6);
      } finally { process.env.N8N_STOCK_WEBHOOK_URL = ''; }
    });
    if (process.env.AIP_TEST_SESSION_FILE) writeFileSync(process.env.AIP_TEST_SESSION_FILE, JSON.stringify({ tokens, stamp, producto: producto.idProducto, formula: formula.id, proveedor: proveedor.id, insumo: insumo.id, pedido: pedido.numPedido, jwtSecret: process.env.JWT_SECRET }), { mode: 0o600 });
  } finally {
    await new Promise<void>(r => server.close(() => r()));
    await prisma.$disconnect();
  }
});
