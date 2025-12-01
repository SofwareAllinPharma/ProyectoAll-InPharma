import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { UpdateProfileDto } from '../schemas/profile.dto';
import { normalizeRoleName } from '../utils/roles';

export async function getProfile(req: Request, res: Response) {
  try {
    const mail = (req as any).user?.mail as string;
    if (!mail) return res.status(401).json({ error: 'No autenticado' });

    const user = await prisma.usuario.findUnique({
      where: { mail },
      include: {
        persona: true,
        perfiles: {
          include: {
            perfil: true
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const roles = user.perfiles.map(p => ({
        id: p.perfil.id,
        nombre: p.perfil.nombre,
        descripcion: p.perfil.descripcion,
        code: normalizeRoleName(p.perfil.nombre)
    }));

    return res.json({
      mail: user.mail,
      dni: user.persona?.dni || '',
      nombre: user.persona?.nombre || '',
      apellido: user.persona?.apellido || '',
      telefono: user.persona?.telefono || '',
      roles: roles
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener perfil' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const mail = (req as any).user?.mail as string;
    if (!mail) return res.status(401).json({ error: 'No autenticado' });

    const parse = UpdateProfileDto.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const { dni, nombre, apellido, telefono } = parse.data;

    // Verificar si el DNI ya existe en OTRA persona (si se cambió)
    // Primero obtenemos la persona actual para saber su DNI actual
    const currentPerson = await prisma.persona.findUnique({ where: { mail } });
    
    if (!currentPerson) {
        // Si no existe persona asociada al usuario (raro pero posible por integridad), la creamos?
        // Asumimos que debería existir si se registró bien.
        return res.status(404).json({ error: 'Datos de persona no encontrados' });
    }

    if (dni !== currentPerson.dni) {
        const exists = await prisma.persona.findUnique({ where: { dni } });
        if (exists) {
            return res.status(400).json({ error: 'El DNI ya está registrado por otro usuario' });
        }
    }

    // Actualizamos la persona.
    // Como DNI es PK, si cambia, Prisma hace el update del campo ID.
    await prisma.persona.update({
        where: { mail }, // Buscamos por mail que es unique en Persona
        data: {
            dni,
            nombre,
            apellido,
            telefono
        }
    });

    return res.json({ message: 'Perfil actualizado correctamente' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al actualizar perfil' });
  }
}
