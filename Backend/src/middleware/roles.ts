import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { normalizeRoleName } from "../utils/roles";


export function requireRoles(...allowed: string[]) {
  const allowedSet = new Set(allowed.map((r) => r.toUpperCase()));

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mail = (req as any).user?.mail as string | undefined;
      if (!mail) return res.status(401).json({ error: "No autenticado" });

      let roles = (req as any).roles as string[] | undefined;

      if (!roles) {
        const perfiles: { perfil: { nombre: string } }[] = await prisma.usuarioPerfil.findMany({
          where: { mail },
          select: { perfil: { select: { nombre: true } } },
        });
        // Normalizar nombres de perfil a códigos (TECNICO, ADMINFAB, ADMINSIS)
        roles = perfiles
          .map((p) => normalizeRoleName(p.perfil.nombre))
          .filter((x): x is import("../utils/roles").RoleCode => x !== null)
          .map((r) => r);
        (req as any).roles = roles;
      }

      const userRoles = roles ?? [];
      const ok = userRoles.some((r) => allowedSet.has(r));
      if (!ok) {
        return res.status(403).json({
          error: "Prohibido",
          required: Array.from(allowedSet),
          roles: userRoles,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
