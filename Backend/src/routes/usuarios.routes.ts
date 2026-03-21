import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// GET /usuarios — lista todos los usuarios con datos de persona y perfil
// Usado por el módulo de cronograma para selección de empleados en bloques
router.get("/", async (_req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        persona: true,
        perfiles: {
          include: { perfil: true },
        },
      },
    });

    const resultado = usuarios.map((u) => ({
      mail: u.mail,
      nombre: u.persona?.nombre ?? null,
      apellido: u.persona?.apellido ?? null,
      nombreCompleto:
        u.persona?.nombre && u.persona?.apellido
          ? `${u.persona.nombre} ${u.persona.apellido}`
          : u.mail,
      perfiles: u.perfiles.map((up) => ({
        idPerfil: up.idPerfil,
        nombrePerfil: up.perfil.nombre,
      })),
    }));

    res.json(resultado);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
