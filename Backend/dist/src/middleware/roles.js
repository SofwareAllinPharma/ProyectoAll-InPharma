"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = requireRoles;
const prisma_1 = require("../lib/prisma");
const roles_1 = require("../utils/roles");
function requireRoles(...allowed) {
    const allowedSet = new Set(allowed.map((r) => r.toUpperCase()));
    return async (req, res, next) => {
        try {
            const mail = req.user?.mail;
            if (!mail)
                return res.status(401).json({ error: "No autenticado" });
            let roles = req.roles;
            if (!roles) {
                const perfiles = await prisma_1.prisma.usuarioPerfil.findMany({
                    where: { mail },
                    select: { perfil: { select: { nombre: true } } },
                });
                // Normalizar nombres de perfil a códigos (TECNICO, ADMINFAB, ADMINSIS)
                roles = perfiles
                    .map((p) => (0, roles_1.normalizeRoleName)(p.perfil.nombre))
                    .filter((x) => x !== null)
                    .map((r) => r);
                req.roles = roles;
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
        }
        catch (err) {
            next(err);
        }
    };
}
