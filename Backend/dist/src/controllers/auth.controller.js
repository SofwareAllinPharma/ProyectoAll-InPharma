"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.me = me;
exports.logout = logout;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.register = register;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const roles_1 = require("../utils/roles");
const token_1 = require("../utils/token");
const auth_dto_1 = require("../schemas/auth.dto");
const email_service_1 = require("../services/email.service");
const saltingEncriptacion = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
/** POST /auth/login */
async function login(req, res) {
    try {
        const parse = auth_dto_1.LoginDto.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ error: parse.error.flatten() });
        const { mail, password } = parse.data;
        const user = await prisma_1.prisma.usuario.findUnique({ where: { mail } });
        if (!user)
            return res.status(401).json({ error: 'Credenciales inválidas' });
        const hashed = user.contrasena;
        const ok = await bcrypt_1.default.compare(password, hashed);
        if (!ok)
            return res.status(401).json({ error: 'Credenciales inválidas' });
        await prisma_1.prisma.sesion.create({
            data: { email: mail, fechaHoraInicio: new Date() },
        });
        const token = (0, token_1.signAccessToken)(mail);
        return res.json({ accessToken: token, user: { mail: user.mail } });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error de autenticación' });
    }
}
// Esta ruta devuelve los datos del usuario autenticado, incluyendo sus roles.
// base para el front (hide/show páginas y botones) y para back (proteger rutas con authorizedRoles).
/** GET /auth/me */
async function me(req, res) {
    const mail = req.user?.mail;
    if (!mail)
        return res.status(401).json({ error: 'No autenticado' });
    const dbUser = await prisma_1.prisma.usuario.findUnique({
        where: { mail },
        select: {
            mail: true,
            persona: { select: { nombre: true, apellido: true } },
            perfiles: { select: { perfil: { select: { nombre: true } } } },
        },
    });
    return res.json({
        user: {
            mail: dbUser?.mail,
            name: [dbUser?.persona?.nombre, dbUser?.persona?.apellido]
                .filter(Boolean).join(' ') || null,
            roles: (dbUser?.perfiles ?? [])
                .map((p) => (0, roles_1.normalizeRoleName)(p.perfil.nombre))
                .filter((x) => x !== null),
        },
    });
}
/** POST /auth/logout */
async function logout(req, res) {
    try {
        const { mail } = req.user;
        // Cerrar sesiones abiertas de este usuario (si las manejás en BD)
        await prisma_1.prisma.sesion.updateMany({
            where: { email: mail, fechaHoraFin: null },
            data: { fechaHoraFin: new Date() },
        });
        // Si tu logout es stateless (solo borrar token en el cliente), con esto alcanza:
        return res.json({ ok: true });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error en logout' });
    }
}
/** POST /auth/forgot-password */
async function forgotPassword(req, res) {
    try {
        const parse = auth_dto_1.ForgotDto.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ error: parse.error.flatten() });
        const { mail } = parse.data;
        const user = await prisma_1.prisma.usuario.findUnique({ where: { mail } });
        if (!user)
            return res.status(200).json({ ok: true }); // no revelar
        // Generar token simple (6 dígitos) o string aleatorio.
        const token = crypto_1.default.randomInt(100000, 999999).toString();
        // Guardar hash (no el token en claro) y vencimiento en 15 min.
        const tokenHash = await bcrypt_1.default.hash(token, 8);
        const expires = new Date(Date.now() + 15 * 60 * 1000);
        // Si no tenés la tabla, podés guardar en Redis o en columnas del usuario.
        await prisma_1.prisma.passwordReset.upsert({
            where: { mail },
            update: { tokenHash, expiresAt: expires, used: false },
            create: { mail, tokenHash, expiresAt: expires },
        });
        await (0, email_service_1.sendPasswordResetEmail)(mail, token);
        return res.json({ ok: true });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error en forgot-password' });
    }
}
/** POST /auth/reset-password */
async function resetPassword(req, res) {
    try {
        const parse = auth_dto_1.ResetDto.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ error: parse.error.flatten() });
        const { mail, token, newPassword } = parse.data;
        const rec = await prisma_1.prisma.passwordReset.findUnique({ where: { mail } });
        if (!rec || rec.used || rec.expiresAt < new Date())
            return res.status(400).json({ error: 'Token inválido/expirado' });
        const match = await bcrypt_1.default.compare(token, rec.tokenHash);
        if (!match)
            return res.status(400).json({ error: 'Token inválido' });
        const hash = await bcrypt_1.default.hash(newPassword, saltingEncriptacion);
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.usuario.update({
                where: { mail },
                data: { contrasena: hash },
            }),
            prisma_1.prisma.passwordReset.update({ where: { mail }, data: { used: true } }),
        ]);
        return res.json({ ok: true });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error en reset-password' });
    }
}
/** / POST /auth/register por el momento no la usariamos ya que no hacemos el registro en el spring 1*/
async function register(req, res) {
    try {
        const parse = auth_dto_1.RegisterDto.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ error: parse.error.flatten() });
        const { mail, password, dni, nombre, apellido, telefono } = parse.data;
        const exists = await prisma_1.prisma.usuario.findUnique({ where: { mail } });
        if (exists)
            return res.status(409).json({ error: 'El mail ya está registrado' });
        const hash = await bcrypt_1.default.hash(password, saltingEncriptacion);
        await prisma_1.prisma.usuario.create({
            data: {
                mail,
                contrasena: hash,
                persona: dni ? { create: { dni, nombre: nombre ?? null, apellido: apellido ?? null, telefono: telefono ?? null } } : undefined,
            },
        });
        await prisma_1.prisma.sesion.create({
            data: { email: mail, fechaHoraInicio: new Date() },
        });
        const token = (0, token_1.signAccessToken)(mail);
        return res.status(201).json({ accessToken: token });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error registrando usuario' });
    }
}
