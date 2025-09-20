import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../utils/token';
import { RegisterDto, LoginDto, ForgotDto, ResetDto } from '../schemas/auth.dto';
import { sendPasswordResetEmail } from '../services/email.service';

const saltingEncriptacion = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

/** POST /auth/login */
export async function login(req: Request, res: Response) {
  try {
    const parse = LoginDto.safeParse(req.body); 
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const { mail, password } = parse.data;

    const user = await prisma.usuario.findUnique({ where: { mail } });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const hashed = user.contrasena;
    const ok = await bcrypt.compare(password, hashed);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    await prisma.sesion.create({
      data: { email: mail, fechaHoraInicio: new Date() } as any,
    });

    const token = signAccessToken(mail);
    return res.json({ accessToken: token, user: { mail: user.mail } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error de autenticación' });
  }
}

/** POST /auth/forgot-password */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const parse = ForgotDto.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const { mail } = parse.data;
    const user = await prisma.usuario.findUnique({ where: { mail } });
    if (!user) return res.status(200).json({ ok: true }); // no revelar

    // Generar token simple (6 dígitos) o string aleatorio.
    const token = crypto.randomInt(100000, 999999).toString();

    // Guardar hash (no el token en claro) y vencimiento en 15 min.
    const tokenHash = await bcrypt.hash(token, 8);
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // Si no tenés la tabla, podés guardar en Redis o en columnas del usuario.
    await prisma.passwordReset.upsert({
      where: { mail },
      update: { tokenHash, expiresAt: expires, used: false },
      create: { mail, tokenHash, expiresAt: expires },
    });

    await sendPasswordResetEmail(mail, token);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error en forgot-password' });
  }
}

/** POST /auth/reset-password */
export async function resetPassword(req: Request, res: Response) {
  try {
    const parse = ResetDto.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const { mail, token, newPassword } = parse.data;

    const rec = await prisma.passwordReset.findUnique({ where: { mail } });
    if (!rec || rec.used || rec.expiresAt < new Date())
      return res.status(400).json({ error: 'Token inválido/expirado' });

    const match = await bcrypt.compare(token, rec.tokenHash);
    if (!match) return res.status(400).json({ error: 'Token inválido' });

    const hash = await bcrypt.hash(newPassword, saltingEncriptacion);

    await prisma.$transaction([
      prisma.usuario.update({
        where: { mail },
        data: { contrasena: hash },
      }),
      prisma.passwordReset.update({ where: { mail }, data: { used: true } }),
    ]);

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error en reset-password' });
  }
}


/** / POST /auth/register por el momento no la usariamos ya que no hacemos el registro en el spring 1*/
export async function register(req: Request, res: Response) {
  try {
    const parse = RegisterDto.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const { mail, password, dni, nombre, apellido, telefono } = parse.data;

    const exists = await prisma.usuario.findUnique({ where: { mail } });
    if (exists) return res.status(409).json({ error: 'El mail ya está registrado' });

    const hash = await bcrypt.hash(password, saltingEncriptacion);

    await prisma.usuario.create({
      data: {
        mail,
        contrasena: hash,
        persona: dni ? { create: { dni, nombre: nombre ?? null, apellido: apellido ?? null, telefono: telefono ?? null } } : undefined,
      },
    });


    await prisma.sesion.create({
      data: { email: mail, fechaHoraInicio: new Date() } as any,
    });

    const token = signAccessToken(mail);
    return res.status(201).json({ accessToken: token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error registrando usuario' });
  }
}
