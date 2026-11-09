import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { mapProfileAssignments, rolesFromAssignments, type ProfileAssignment } from '../utils/roles';

const SECRET = process.env.JWT_SECRET ?? '';
if (!SECRET) throw new Error('JWT_SECRET no definido');

export type AuthenticatedRequest = Request & {
  user?: { mail: string; perfiles: ProfileAssignment[] };
  roles?: string[];
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  let mail: string;
  try {
    const payload = jwt.verify(token, SECRET);
    if (typeof payload === 'string' || typeof payload.sub !== 'string' || !payload.sub.trim()) {
      return res.status(401).json({ error: 'Token inválido/expirado' });
    }
    mail = payload.sub;
  } catch {
    return res.status(401).json({ error: 'Token inválido/expirado' });
  }

  try {
    // Los permisos y la baja del usuario se revalidan en cada petición, no desde claims viejos.
    const user = await prisma.usuario.findUnique({
      where: { mail },
      select: { mail: true, activo: true, perfiles: { select: { idPerfil: true, perfil: { select: { nombre: true } } }, orderBy: { idPerfil: 'asc' } } },
    });
    if (!user || !user.activo) return res.status(401).json({ error: 'Sesión inválida. Iniciá sesión nuevamente.' });
    const perfiles = mapProfileAssignments(user.perfiles);
    const authenticated = req as AuthenticatedRequest;
    authenticated.user = { mail: user.mail, perfiles };
    authenticated.roles = rolesFromAssignments(perfiles);
    next();
  } catch (error) {
    next(error);
  }
}
