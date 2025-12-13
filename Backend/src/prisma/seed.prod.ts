// src/prisma/seed.prod.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { INSUMOS_BASE } from './insumos.base';

let bcrypt: any;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  bcrypt = require('bcrypt');
}

const prisma = new PrismaClient();

async function main() {
  console.log('=== Seed de PRODUCCIÓN ===');

  // 1) PERFILES (igual que en dev)
  const perfiles = [
    { id: 1, nombre: 'tecnico',      descripcion: 'tecnico' },
    { id: 2, nombre: 'adminfab',     descripcion: 'administrador de fabrica' },
    { id: 3, nombre: 'adminsis',     descripcion: 'administrador del sistema' },
    { id: 4, nombre: 'encptoventa',  descripcion: 'encargado de punto de venta' },
  ];

  for (const p of perfiles) {
    await prisma.perfil.upsert({
      where: { id: p.id },
      update: { nombre: p.nombre, descripcion: p.descripcion ?? null },
      create: p,
    });
  }
  console.log('✔ PERFILES listos');

  // 2) Contraseña base (la misma para todos en seed prod)
  const plain = process.env.SEED_DEFAULT_PASSWORD ?? 'admin2025';
  if (!process.env.SEED_DEFAULT_PASSWORD) {
    console.warn(
      '[WARN] SEED_DEFAULT_PASSWORD no definida, usando "admin2025" para usuarios iniciales de PRODUCCIÓN.'
    );
  }
  const hash = await bcrypt.hash(plain, 10);

  // 3) Usuarios base de producción
  const usuarios = [
    // ADMIN DEL SISTEMA = FEDE
    {
      mail: 'cfarrigoni@gmail.com',
      idPerfil: 3, // adminsis
      dni: '22898957',
      nombre: 'Federico',
      apellido: 'Arrigoni',
      telefono: '155048803',
    },
    // TÉCNICO
    {
      mail: 'tecnico@allinpharma.com',
      idPerfil: 1,
      dni: '20111111',
      nombre: 'Técnico',
      apellido: 'AllInPharma',
      telefono: '1100000001',
    },
    // ADMIN FÁBRICA
    {
      mail: 'adminfab@allinpharma.com',
      idPerfil: 2,
      dni: '20222222',
      nombre: 'Admin',
      apellido: 'Fábrica',
      telefono: '1100000002',
    },
    // ENCARGADO PUNTO DE VENTA
    {
      mail: 'encptoventa@allinpharma.com',
      idPerfil: 4,
      dni: '20333333',
      nombre: 'Encargado',
      apellido: 'PuntoVenta',
      telefono: '1100000003',
    },
  ];

  for (const u of usuarios) {
    // USUARIO
    await prisma.usuario.upsert({
      where: { mail: u.mail },
      update: { contrasena: hash },
      create: { mail: u.mail, contrasena: hash },
    });

    // PERSONA
    await prisma.persona.upsert({
      where: { mail: u.mail },
      update: {
        nombre: u.nombre ?? null,
        apellido: u.apellido ?? null,
        telefono: u.telefono ?? null,
      },
      create: {
        dni: u.dni,
        mail: u.mail,
        nombre: u.nombre ?? null,
        apellido: u.apellido ?? null,
        telefono: u.telefono ?? null,
      },
    });

    // USUARIOxPERFIL
    await prisma.usuarioPerfil.upsert({
      where: { mail_idPerfil: { mail: u.mail, idPerfil: u.idPerfil } },
      update: {},
      create: { mail: u.mail, idPerfil: u.idPerfil },
    });
  }
  console.log('✔ USUARIOS, PERSONAS y USUARIOxPERFIL de PRODUCCIÓN listos');

  // 4) INSUMOS (TODOS los de INSUMOS_BASE)
  await prisma.insumo.createMany({
    data: INSUMOS_BASE,
    skipDuplicates: true,
  });
  console.log(`✔ INSUMOS cargados (${INSUMOS_BASE.length} registros)`);

  // 5) DEPÓSITOS (Farmacia y Fábrica con IDs fijos)
  const depositos = [
    {
      id: 1,
      nombre: 'Farmacia',
      direccion: 'Belgrano 2005',
      responsable: `${usuarios[3].nombre} ${usuarios[3].apellido}`, // Encargado punto de venta (índice 3)
      capacidadTotal: 2000,
      capacidadUsada: 0,
      estado: true,
      esProtegido: true,
    },
    {
      id: 2,
      nombre: 'Fábrica',
      direccion: 'Asmar 444',
      responsable: `${usuarios[2].nombre} ${usuarios[2].apellido}`, // Admin fábrica (índice 2)
      capacidadTotal: 5000,
      capacidadUsada: 0,
      estado: true,
      esProtegido: true,
    },
  ];

  for (const d of depositos) {
    await prisma.deposito.upsert({
      where: { id: d.id },
      update: { 
        nombre: d.nombre,
        direccion: d.direccion,
        responsable: d.responsable,
        capacidadTotal: d.capacidadTotal,
        capacidadUsada: d.capacidadUsada,
        estado: d.estado,
        esProtegido: d.esProtegido,
      },
      create: d,
    });
  }
  console.log('✔ DEPÓSITOS listos (Farmacia y Fábrica)');

  console.log('=== Seed de PRODUCCIÓN COMPLETADO OK ===');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error durante el seed de PRODUCCIÓN:');
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
