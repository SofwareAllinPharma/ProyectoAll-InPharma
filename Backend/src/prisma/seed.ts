// src/prisma/seed.ts
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1) Perfiles
  const perfiles = [
    { id: 1, nombre: 'tecnico',  descripcion: 'tecnico' },
    { id: 2, nombre: 'adminfab', descripcion: 'administrador de fabrica' },
    { id: 3, nombre: 'adminsis', descripcion: 'administrador del sistema' },
  ]
  for (const p of perfiles) {
    await prisma.perfil.upsert({
      where: { id: p.id },
      update: { nombre: p.nombre, descripcion: p.descripcion ?? null },
      create: p,
    })
  }

  // 2) Usuarios
  const plain = process.env.SEED_DEFAULT_PASSWORD
  if (!plain) {
    console.log('SEED_DEFAULT_PASSWORD no definida: omito creación/actualización de usuarios.')
  }

  const hash = plain ? await bcrypt.hash(plain, 10) : null
  const usuarios = [
    { mail: 'adminfab@aip.com',               idPerfil: 2 },
    { mail: 'adminsis@aip.com',               idPerfil: 3 },
    { mail: 'softwareallinpharma@gmail.com',  idPerfil: 3 },
    { mail: 'tecnico@aip.com',                idPerfil: 1 },
  ]

  if (hash) {
    for (const u of usuarios) {
      await prisma.usuario.upsert({
        where: { mail: u.mail },
        update: { contrasena: hash },     // campo Prisma -> mapea a columna "contraseña"
        create: { mail: u.mail, contrasena: hash },
      })
    }

    // 3) Relación Usuario-Perfil (clave compuesta)
    await prisma.usuarioPerfil.createMany({
      data: usuarios.map(u => ({ mail: u.mail, idPerfil: u.idPerfil })),
      skipDuplicates: true,
    })
  }

  console.log('✔ Seed ejecutado OK')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
