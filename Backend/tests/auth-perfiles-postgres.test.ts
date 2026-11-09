import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes, randomInt } from 'node:crypto';

// Fail closed: esta prueba jamás carga DATABASE_URL de .env ni acepta otro destino.
const destino = new URL(process.env.AIP_TEST_DATABASE_URL ?? 'postgresql://invalid/invalid');
assert.equal(destino.hostname, '127.0.0.1');
assert.equal(destino.port, '55447');
assert.equal(destino.pathname, '/aip_entrega_test');
process.env.DATABASE_URL = destino.toString();
process.env.JWT_SECRET = randomBytes(32).toString('hex');
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';
const { prisma } = require('../src/lib/prisma') as typeof import('../src/lib/prisma');
const express = require('express') as typeof import('express');
const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');
const bcrypt = require('bcrypt') as typeof import('bcrypt');
const { selectAssignedProfile } = require('../../frontend/src/utils/roles') as typeof import('../../frontend/src/utils/roles');
const stamp = `${Date.now()}-${randomBytes(4).toString('hex')}`;

test('HTTP sesión/perfiles actuales sobre PostgreSQL aislado', async t => {
  const app = express(); app.use(express.json());
  app.use('/auth', require('../src/routes/auth.routes').default);
  app.use('/proveedores', require('../src/routes/proveedores.routes').default);
  app.use('/productos', require('../src/routes/productos.routes').default);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    const mail = `aip-auth-multi-${stamp}@example.invalid`;
    const password = randomBytes(24).toString('hex');
    const admin = await prisma.perfil.create({ data: { id: randomInt(5_000_000, 9_000_000), nombre: 'Administrador de Fábrica' } });
    const tecnico = await prisma.perfil.create({ data: { id: randomInt(10_000_000, 14_000_000), nombre: 'Técnico' } });
    await prisma.usuario.create({ data: { mail, contrasena: await bcrypt.hash(password, 4), perfiles: { create: [{ idPerfil: admin.id }, { idPerfil: tecnico.id }] } } });
    const proveedor = await prisma.proveedor.create({ data: { nombre: `Auth proveedor ${stamp}` } });
    let token = '';
    const get = (path: string, accessToken = token) => fetch(base + path, { headers: { Authorization: 'Bearer ' + accessToken } });
    await t.test('login real y me retornan asignaciones arbitrarias y multirol', async () => {
      const login = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mail, password }) });
      assert.equal(login.status, 200);
      const body = await login.json() as { accessToken: string }; token = body.accessToken;
      const me = await get('/auth/me'); assert.equal(me.status, 200);
      const session = await me.json() as { user: { perfiles: { idPerfil: number; nombre: string; role: 'ADMINFAB' | 'TECNICO' | null }[]; roles: string[] } };
      assert.deepEqual(session.user.roles, ['ADMINFAB', 'TECNICO']);
      assert.equal(selectAssignedProfile(session.user.perfiles, 'ADMINFAB')?.idPerfil, admin.id);
      assert.equal(selectAssignedProfile(session.user.perfiles, 'TECNICO')?.idPerfil, tecnico.id);
      assert.equal((await get(`/proveedores/${proveedor.id}`)).status, 200);
    });
    await t.test('revocar ADMINFAB se aplica al JWT existente; costo producto mantiene acceso autenticado', async () => {
      await prisma.usuarioPerfil.delete({ where: { mail_idPerfil: { mail, idPerfil: admin.id } } });
      const me = await get('/auth/me'); assert.equal(me.status, 200);
      const session = await me.json() as { user: { roles: string[] } };
      assert.deepEqual(session.user.roles, ['TECNICO']);
      assert.equal((await get(`/proveedores/${proveedor.id}`)).status, 403);
      // No existe el producto: 400 de negocio, no 403 de roles. Se conserva lectura de costo para autenticados.
      assert.equal((await get('/productos/0/costo')).status, 400);
    });
    await t.test('usuario dado de baja rechaza token válido e impide login', async () => {
      await prisma.usuario.update({ where: { mail }, data: { activo: false } });
      assert.equal((await get('/auth/me')).status, 401);
      assert.equal((await get(`/proveedores/${proveedor.id}`)).status, 401);
      const login = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mail, password }) });
      assert.equal(login.status, 403);
    });
    await t.test('token de usuario inexistente y JWT expirado no dan sesión', async () => {
      const missing = jwt.sign({}, process.env.JWT_SECRET!, { subject: `aip-auth-missing-${stamp}@example.invalid`, expiresIn: '1h' });
      assert.equal((await get('/auth/me', missing)).status, 401);
      const expired = jwt.sign({}, process.env.JWT_SECRET!, { subject: mail, expiresIn: -1 });
      assert.equal((await get('/auth/me', expired)).status, 401);
      assert.equal((await fetch(base + '/auth/me')).status, 401);
    });
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await prisma.$disconnect();
  }
});
