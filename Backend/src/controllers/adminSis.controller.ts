import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { CreateUserDto, UpdateUserDto } from '../schemas/admin.dto';

const saltingEncriptacion = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

export async function registerUser(req: Request, res: Response) {
  try {
    const parse = CreateUserDto.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const { mail, password, dni, nombre, apellido, telefono, roles } = parse.data;

    // Check if user or person already exists
    const existingUser = await prisma.usuario.findUnique({ where: { mail } });
    if (existingUser) return res.status(400).json({ error: 'El usuario ya existe' });

    const existingPerson = await prisma.persona.findUnique({ where: { dni } });
    if (existingPerson) return res.status(400).json({ error: 'La persona con ese DNI ya existe' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltingEncriptacion);

    // Find profiles
    const allProfiles = await prisma.perfil.findMany();
    const profilesToAssign = allProfiles.filter(p => 
        roles.some(r => r.toLowerCase() === p.nombre.toLowerCase())
    );
    
    if (profilesToAssign.length === 0) {
        return res.status(400).json({ error: 'No se encontraron roles válidos' });
    }

    // Transaction
    await prisma.$transaction(async (tx) => {
      // Create Usuario
      await tx.usuario.create({
        data: {
          mail,
          contrasena: hashedPassword,
        },
      });

      // Create Persona
      await tx.persona.create({
        data: {
          dni,
          mail,
          nombre,
          apellido,
          telefono,
        },
      });

      // Assign Roles
      await tx.usuarioPerfil.createMany({
        data: profilesToAssign.map(p => ({
          mail,
          idPerfil: p.id
        }))
      });
    });

    return res.status(201).json({ message: 'Usuario creado exitosamente' });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error al crear usuario' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { mail } = req.params;
    const parse = UpdateUserDto.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const { dni, nombre, apellido, telefono, roles } = parse.data;

    // Check if user exists
    const existingUser = await prisma.usuario.findUnique({ where: { mail } });
    if (!existingUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Check if DNI is used by another person
    const existingPerson = await prisma.persona.findUnique({ where: { dni } });
    if (existingPerson && existingPerson.mail !== mail) {
      return res.status(400).json({ error: 'El DNI ya está en uso por otro usuario' });
    }

    // Find profiles
    const allProfiles = await prisma.perfil.findMany();
    const profilesToAssign = allProfiles.filter(p => 
        roles.some(r => r.toLowerCase() === p.nombre.toLowerCase())
    );
    
    if (profilesToAssign.length === 0) {
        return res.status(400).json({ error: 'No se encontraron roles válidos' });
    }

    await prisma.$transaction(async (tx) => {
      // Update Persona
      await tx.persona.update({
        where: { mail },
        data: {
          dni,
          nombre,
          apellido,
          telefono,
        },
      });

      // Update Roles: Delete all and re-create
      await tx.usuarioPerfil.deleteMany({ where: { mail } });
      await tx.usuarioPerfil.createMany({
        data: profilesToAssign.map(p => ({
          mail,
          idPerfil: p.id
        }))
      });
    });

    return res.json({ message: 'Usuario actualizado exitosamente' });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }
}

export async function getRoles(req: Request, res: Response) {
    try {
        const roles = await prisma.perfil.findMany();
        res.json(roles);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error al obtener roles' });
    }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await prisma.usuario.findMany({
      include: {
        persona: true,
        perfiles: {
          include: {
            perfil: true
          }
        }
      }
    });

    const formattedUsers = users.map(u => ({
      mail: u.mail,
      dni: u.persona?.dni,
      nombre: u.persona?.nombre,
      apellido: u.persona?.apellido,
      telefono: u.persona?.telefono,
      roles: u.perfiles.map(p => p.perfil.nombre)
    }));

    res.json(formattedUsers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}
