import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';

process.env.JWT_SECRET = randomBytes(32).toString('hex');
process.env.JWT_EXPIRES_IN = '1h';
const mail = 'perfiles-sinteticos@example.invalid';
const asignaciones = [
  { idPerfil: 407, perfil: { nombre: 'Administrador de Fábrica' } },
  { idPerfil: 91, perfil: { nombre: 'Técnico' } },
  { idPerfil: 892, perfil: { nombre: 'ADMINFAB' } },
  { idPerfil: 24, perfil: { nombre: 'Perfil no operativo' } },
];
let user: { mail: string; activo: boolean; perfiles: typeof asignaciones; persona: { nombre: string; apellido: string } } | null = { mail, activo: true, perfiles: asignaciones, persona: { nombre: 'Persona', apellido: 'Sintética' } };
let dbError = false;
(global as typeof globalThis & { prisma?: PrismaClient }).prisma = {
  usuario: { findUnique: async ({ where }: { where: { mail: string } }) => { if (dbError) throw new Error('DB temporal no disponible'); return user?.mail === where.mail ? user : null; } },
} as unknown as PrismaClient;
const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');
const { requireAuth } = require('../src/middleware/auth') as typeof import('../src/middleware/auth');
const { requireRoles } = require('../src/middleware/roles') as typeof import('../src/middleware/roles');
const { me } = require('../src/controllers/auth.controller') as typeof import('../src/controllers/auth.controller');
const { selectAssignedProfile } = require('../../frontend/src/utils/roles') as typeof import('../../frontend/src/utils/roles');
const token = jwt.sign({}, process.env.JWT_SECRET!, { subject: mail, expiresIn: '1h' });

function response() {
  return { code: 200, body: undefined as unknown, status(code: number) { this.code = code; return this; }, json(body: unknown) { this.body = body; return this; } };
}
async function authenticate(value: string) {
  const req = { headers: { authorization: value ? `Bearer ${value}` : '' } };
  const res = response();
  let nextCalled = false;
  let error: unknown;
  await requireAuth(req as never, res as never, (err?: unknown) => { nextCalled = true; error = err; });
  return { req: req as typeof req & { user?: { mail: string; perfiles: { idPerfil: number; nombre: string; role: string | null }[] }; roles?: string[] }, res, nextCalled, error };
}

test('sesión y perfiles reales sin depender de IDs1/2/3', async t => {
  await t.test('me conserva IDs/nombres reales, normaliza acentos y deduplica códigos', async () => {
    const { req, nextCalled } = await authenticate(token);
    assert.equal(nextCalled, true);
    assert.deepEqual(req.roles, ['ADMINFAB', 'TECNICO']);
    assert.equal(req.user?.perfiles[0].idPerfil, 407);
    const res = response();
    await me(req as never, res as never);
    const body = res.body as { user: { mail: string; name: string; perfiles: { idPerfil: number; nombre: string; role: 'ADMINFAB' | 'TECNICO' | null }[]; roles: string[] } };
    assert.equal(body.user.mail, mail);
    assert.equal(body.user.name, 'Persona Sintética');
    assert.deepEqual(body.user.roles, ['ADMINFAB', 'TECNICO']);
    assert.equal(body.user.perfiles.find(p => p.idPerfil === 24)?.role, null);
    assert.equal(selectAssignedProfile(body.user.perfiles, 'ADMINFAB')?.idPerfil, 407);
    assert.equal(selectAssignedProfile(body.user.perfiles, 'TECNICO')?.idPerfil, 91);
    assert.equal(selectAssignedProfile(body.user.perfiles, 'ENCPTOVENTA', ['ADMINFAB'])?.idPerfil, 407);
    assert.equal(selectAssignedProfile(body.user.perfiles, 'ENCPTOVENTA', ['ENCPTOVENTA']), undefined);
    assert.equal(selectAssignedProfile([], 'ADMINSIS'), undefined);
  });
  await t.test('la baja o eliminación de usuario rechaza un token aún firmado y vigente', async () => {
    const original = user!;
    user = { ...original, activo: false };
    const inactivo = await authenticate(token);
    assert.equal(inactivo.res.code, 401); assert.equal(inactivo.nextCalled, false);
    const res = response();
    await me({ user: { mail } } as never, res as never); assert.equal(res.code, 401);
    user = null;
    assert.equal((await authenticate(token)).res.code, 401);
    user = original;
  });
  await t.test('cambiar perfiles en DB afecta a la siguiente petición sin reloguear', async () => {
    const original = user!;
    user = { ...original, perfiles: [{ idPerfil: 91, perfil: { nombre: 'Técnico' } }] };
    const { req } = await authenticate(token);
    assert.deepEqual(req.roles, ['TECNICO']);
    const res = response();
    let allowed = false;
    await requireRoles('ADMINFAB', 'ADMINSIS')(req as never, res as never, () => { allowed = true; });
    assert.equal(res.code, 403); assert.equal(allowed, false);
    const tecnico = response();
    await requireRoles('TECNICO')(req as never, tecnico as never, () => { allowed = true; });
    assert.equal(tecnico.code, 200); assert.equal(allowed, true);
    user = original;
  });
  await t.test('token ausente, inválido, sin subject y expirado se rechazan', async () => {
    for (const invalid of ['', 'invalid', jwt.sign({}, process.env.JWT_SECRET!), jwt.sign({}, process.env.JWT_SECRET!, { subject: mail, expiresIn: -1 })]) {
      const result = await authenticate(invalid);
      assert.equal(result.res.code, 401); assert.equal(result.nextCalled, false);
    }
  });
  await t.test('error de DB se propaga y no se disfraza de contraseña incorrecta', async () => {
    dbError = true;
    const result = await authenticate(token);
    assert.equal(result.nextCalled, true); assert.ok(result.error instanceof Error);
    assert.equal(result.res.code, 200);
    dbError = false;
  });
});
