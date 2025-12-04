import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getAllPersonas(req: Request, res: Response) {
  try {
    const personas = await prisma.persona.findMany();
    const formatted = personas.map(p => ({ mail: p.mail, dni: p.dni, nombre: p.nombre, apellido: p.apellido, telefono: p.telefono }));
    res.json(formatted);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener personas' });
  }
}
