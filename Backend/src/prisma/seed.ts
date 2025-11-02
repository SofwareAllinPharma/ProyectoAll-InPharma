// src/prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Prefer `bcryptjs` (pure JS). If not installed, fall back to `bcrypt`.
let bcrypt: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  bcrypt = require("bcryptjs");
} catch (e) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  bcrypt = require("bcrypt");
}

const prisma = new PrismaClient();

async function main() {
  // 1) Perfiles
  const perfiles = [
    { id: 1, nombre: "tecnico", descripcion: "tecnico" },
    { id: 2, nombre: "adminfab", descripcion: "administrador de fabrica" },
    { id: 3, nombre: "adminsis", descripcion: "administrador del sistema" },
  ];
  for (const p of perfiles) {
    await prisma.perfil.upsert({
      where: { id: p.id },
      update: { nombre: p.nombre, descripcion: p.descripcion ?? null },
      create: p,
    });
  }

  // Contraseña para usuarios de seed: usar la variable de entorno si existe,
  // sino usar una contraseña por defecto segura para desarrollo.
  const plain = process.env.SEED_DEFAULT_PASSWORD ?? "admin2025";
  if (!process.env.SEED_DEFAULT_PASSWORD) {
    console.log(
      "SEED_DEFAULT_PASSWORD no definida: usando contraseña por defecto 'changeme' para usuarios de seed."
    );
  }

  const hash = await bcrypt.hash(plain, 10);

  // Usuarios que referencian los pedidos/roles del seed. Nos aseguramos de
  // que existan siempre (upsert) para evitar violaciones de FK al crear pedidos.
  const usuarios = [
    { mail: "adminfab@aip.com", idPerfil: 2 },
    { mail: "adminsis@aip.com", idPerfil: 3 },
    { mail: "softwareallinpharma@gmail.com", idPerfil: 3 },
    { mail: "tecnico@aip.com", idPerfil: 1 },
  ];
  for (const u of usuarios) {
    // upsert Usuario (contraseña siempre definida, incluso si es la por defecto)
    await prisma.usuario.upsert({
      where: { mail: u.mail },
      update: { contrasena: hash }, // Prisma -> columna "contraseña"
      create: { mail: u.mail, contrasena: hash },
    });
  }

  // 3) Relación Usuario-Perfil (clave compuesta)
  await prisma.usuarioPerfil.createMany({
    data: usuarios.map((u) => ({ mail: u.mail, idPerfil: u.idPerfil })),
    skipDuplicates: true,
  });

  // 4) Insumos
  const insumos = [
    {
      nombre: "Aceite de Coco",
      cal_100g: 900,
      grasasTotales_100g: 100,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 90,
      proteinas_100g: 0,
      carbohidratos_100g: 0,
      sodio_100g: 0,
      fibra_100g: 0,
      otro_100g: 0,
    },
    {
      nombre: "Ajo en Polvo (imp. premium)",
      cal_100g: 330,
      grasasTotales_100g: 0.7,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.1,
      proteinas_100g: 16,
      carbohidratos_100g: 72,
      sodio_100g: 0.1,
      fibra_100g: 9,
      otro_100g: 2,
    },
    {
      nombre: "Albahaca deshidratada",
      cal_100g: 250,
      grasasTotales_100g: 4,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.5,
      proteinas_100g: 23,
      carbohidratos_100g: 60,
      sodio_100g: 0.05,
      fibra_100g: 37,
      otro_100g: 5,
    },
    {
      nombre: "Albúmina de Huevo",
      cal_100g: 380,
      grasasTotales_100g: 1,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.2,
      proteinas_100g: 80,
      carbohidratos_100g: 8,
      sodio_100g: 0.2,
      fibra_100g: 0,
      otro_100g: 10,
    },
    {
      nombre: "Almendras",
      cal_100g: 580,
      grasasTotales_100g: 50,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 4,
      proteinas_100g: 21,
      carbohidratos_100g: 22,
      sodio_100g: 0.01,
      fibra_100g: 12,
      otro_100g: 5,
    },
    {
      nombre: "Arroz Crocante",
      cal_100g: 400,
      grasasTotales_100g: 1,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.3,
      proteinas_100g: 7,
      carbohidratos_100g: 86,
      sodio_100g: 0.01,
      fibra_100g: 1,
      otro_100g: 4,
    },
    {
      nombre: "Avena",
      cal_100g: 370,
      grasasTotales_100g: 7,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 1,
      proteinas_100g: 13,
      carbohidratos_100g: 68,
      sodio_100g: 0.005,
      fibra_100g: 10,
      otro_100g: 2,
    },
    {
      nombre: "Berenjena Deshidratada",
      cal_100g: 250,
      grasasTotales_100g: 1,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.1,
      proteinas_100g: 10,
      carbohidratos_100g: 60,
      sodio_100g: 0.01,
      fibra_100g: 25,
      otro_100g: 5,
    },
    {
      nombre: "Cacao Amargo Fenix 54",
      cal_100g: 240,
      grasasTotales_100g: 14,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 8,
      proteinas_100g: 20,
      carbohidratos_100g: 22,
      sodio_100g: 0.02,
      fibra_100g: 30,
      otro_100g: 5,
    },
    {
      nombre: "Cacao Amargo Fenix 56",
      cal_100g: 240,
      grasasTotales_100g: 14,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 8,
      proteinas_100g: 20,
      carbohidratos_100g: 22,
      sodio_100g: 0.02,
      fibra_100g: 30,
      otro_100g: 5,
    },
    {
      nombre: "Café Instantáneo",
      cal_100g: 200,
      grasasTotales_100g: 0,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0,
      proteinas_100g: 12,
      carbohidratos_100g: 70,
      sodio_100g: 0.02,
      fibra_100g: 3,
      otro_100g: 5,
    },
    {
      nombre: "Cebolla en Polvo",
      cal_100g: 350,
      grasasTotales_100g: 1,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.2,
      proteinas_100g: 10,
      carbohidratos_100g: 80,
      sodio_100g: 0.05,
      fibra_100g: 6,
      otro_100g: 3,
    },
    {
      nombre: "Cloruro de Sodio",
      cal_100g: 0,
      grasasTotales_100g: 0,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0,
      proteinas_100g: 0,
      carbohidratos_100g: 0,
      sodio_100g: 39,
      fibra_100g: 0,
      otro_100g: 61,
    },
    {
      nombre: "Colageno Hidrolizado (mathpro)",
      cal_100g: 370,
      grasasTotales_100g: 0,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0,
      proteinas_100g: 90,
      carbohidratos_100g: 0,
      sodio_100g: 0,
      fibra_100g: 0,
      otro_100g: 10,
    },
    {
      nombre: "Concentrado de Suero de Queso",
      cal_100g: 380,
      grasasTotales_100g: 3,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 1,
      proteinas_100g: 80,
      carbohidratos_100g: 8,
      sodio_100g: 0.05,
      fibra_100g: 0,
      otro_100g: 8,
    },
    {
      nombre: "Curcuma (Callieri)",
      cal_100g: 300,
      grasasTotales_100g: 1,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.2,
      proteinas_100g: 10,
      carbohidratos_100g: 65,
      sodio_100g: 0.01,
      fibra_100g: 22,
      otro_100g: 2,
    },
    {
      nombre: "Dextrosa",
      cal_100g: 370,
      grasasTotales_100g: 0,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0,
      proteinas_100g: 0,
      carbohidratos_100g: 92,
      sodio_100g: 0.01,
      fibra_100g: 0,
      otro_100g: 8,
    },
    {
      nombre: "DDL Polvo HIS ESTABON COMPLEX DOL",
      cal_100g: 420,
      grasasTotales_100g: 8,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 2,
      proteinas_100g: 5,
      carbohidratos_100g: 82,
      sodio_100g: 0.2,
      fibra_100g: 1,
      otro_100g: 2,
    },
    {
      nombre: "Espinaca deshidratada (en escamas)",
      cal_100g: 270,
      grasasTotales_100g: 3,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.5,
      proteinas_100g: 25,
      carbohidratos_100g: 40,
      sodio_100g: 0.02,
      fibra_100g: 30,
      otro_100g: 2,
    },
    {
      nombre: "Expandido de Maíz Tipo Copo",
      cal_100g: 380,
      grasasTotales_100g: 1,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.2,
      proteinas_100g: 7,
      carbohidratos_100g: 85,
      sodio_100g: 0.01,
      fibra_100g: 2,
      otro_100g: 5,
    },
    {
      nombre: "Germen de Trigo",
      cal_100g: 350,
      grasasTotales_100g: 9,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 1.5,
      proteinas_100g: 25,
      carbohidratos_100g: 50,
      sodio_100g: 0.02,
      fibra_100g: 14,
      otro_100g: 1,
    },
    {
      nombre: "Jugo de Frutilla en Polvo",
      cal_100g: 380,
      grasasTotales_100g: 0,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0,
      proteinas_100g: 0,
      carbohidratos_100g: 95,
      sodio_100g: 0.01,
      fibra_100g: 0,
      otro_100g: 5,
    },
    {
      nombre: "Lecitina de Soja",
      cal_100g: 700,
      grasasTotales_100g: 70,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 15,
      proteinas_100g: 5,
      carbohidratos_100g: 5,
      sodio_100g: 0.01,
      fibra_100g: 0,
      otro_100g: 5,
    },
    {
      nombre: "Levadura de Cerveza",
      cal_100g: 350,
      grasasTotales_100g: 5,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 1,
      proteinas_100g: 40,
      carbohidratos_100g: 40,
      sodio_100g: 0.02,
      fibra_100g: 20,
      otro_100g: 3,
    },
    {
      nombre: "Maltodextrinas",
      cal_100g: 380,
      grasasTotales_100g: 0,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0,
      proteinas_100g: 0,
      carbohidratos_100g: 95,
      sodio_100g: 0.01,
      fibra_100g: 0,
      otro_100g: 5,
    },
    {
      nombre: "Nueces",
      cal_100g: 650,
      grasasTotales_100g: 65,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 6,
      proteinas_100g: 15,
      carbohidratos_100g: 14,
      sodio_100g: 0.01,
      fibra_100g: 7,
      otro_100g: 2,
    },
    {
      nombre: "Pasas de Uva",
      cal_100g: 300,
      grasasTotales_100g: 0.5,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.1,
      proteinas_100g: 3,
      carbohidratos_100g: 79,
      sodio_100g: 0.01,
      fibra_100g: 4,
      otro_100g: 13,
    },
    {
      nombre: "Perejil Deshidratado",
      cal_100g: 270,
      grasasTotales_100g: 4,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.5,
      proteinas_100g: 22,
      carbohidratos_100g: 50,
      sodio_100g: 0.02,
      fibra_100g: 27,
      otro_100g: 3,
    },
    {
      nombre: "Pimentón Extra Callieri",
      cal_100g: 320,
      grasasTotales_100g: 13,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 2,
      proteinas_100g: 14,
      carbohidratos_100g: 50,
      sodio_100g: 0.02,
      fibra_100g: 35,
      otro_100g: 1,
    },
    {
      nombre: "Proteína de Leche (suero)",
      cal_100g: 380,
      grasasTotales_100g: 2,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 1,
      proteinas_100g: 80,
      carbohidratos_100g: 8,
      sodio_100g: 0.05,
      fibra_100g: 0,
      otro_100g: 10,
    },
    {
      nombre: "Proteínas de Soja",
      cal_100g: 360,
      grasasTotales_100g: 7,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 1,
      proteinas_100g: 50,
      carbohidratos_100g: 35,
      sodio_100g: 0.01,
      fibra_100g: 8,
      otro_100g: 1,
    },
    {
      nombre: "Puerro en Trozos Deshidratado",
      cal_100g: 290,
      grasasTotales_100g: 1,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.2,
      proteinas_100g: 10,
      carbohidratos_100g: 70,
      sodio_100g: 0.02,
      fibra_100g: 25,
      otro_100g: 4,
    },
    {
      nombre: "His Estabon Complex Parm",
      cal_100g: 420,
      grasasTotales_100g: 10,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 3,
      proteinas_100g: 10,
      carbohidratos_100g: 75,
      sodio_100g: 0.2,
      fibra_100g: 0,
      otro_100g: 2,
    },
    {
      nombre: "Romero",
      cal_100g: 330,
      grasasTotales_100g: 15,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 2,
      proteinas_100g: 4,
      carbohidratos_100g: 65,
      sodio_100g: 0.02,
      fibra_100g: 43,
      otro_100g: 1,
    },
    {
      nombre: "Saborizante Chocolate rbp 10845",
      cal_100g: 380,
      grasasTotales_100g: 5,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 1,
      proteinas_100g: 0,
      carbohidratos_100g: 90,
      sodio_100g: 0.01,
      fibra_100g: 0,
      otro_100g: 4,
    },
    {
      nombre: "Saborizante Cuatro Quesos",
      cal_100g: 390,
      grasasTotales_100g: 8,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 2,
      proteinas_100g: 5,
      carbohidratos_100g: 80,
      sodio_100g: 0.2,
      fibra_100g: 0,
      otro_100g: 5,
    },
    {
      nombre: "Saborizante DDL rbp 10046",
      cal_100g: 400,
      grasasTotales_100g: 7,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 2,
      proteinas_100g: 3,
      carbohidratos_100g: 82,
      sodio_100g: 0.1,
      fibra_100g: 0,
      otro_100g: 6,
    },
    {
      nombre: "Saborizante Frutilla",
      cal_100g: 380,
      grasasTotales_100g: 0.5,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.1,
      proteinas_100g: 0,
      carbohidratos_100g: 94,
      sodio_100g: 0.01,
      fibra_100g: 0,
      otro_100g: 5,
    },
    {
      nombre: "Saborizante Queso Parmesano",
      cal_100g: 390,
      grasasTotales_100g: 10,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 3,
      proteinas_100g: 5,
      carbohidratos_100g: 78,
      sodio_100g: 0.2,
      fibra_100g: 0,
      otro_100g: 4,
    },
    {
      nombre: "Salvado de Avena",
      cal_100g: 310,
      grasasTotales_100g: 6,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 1,
      proteinas_100g: 16,
      carbohidratos_100g: 60,
      sodio_100g: 0.01,
      fibra_100g: 25,
      otro_100g: 2,
    },
    {
      nombre: "Semilla de Lino Molida",
      cal_100g: 530,
      grasasTotales_100g: 42,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 4,
      proteinas_100g: 18,
      carbohidratos_100g: 29,
      sodio_100g: 0.02,
      fibra_100g: 27,
      otro_100g: 1,
    },
    {
      nombre: "Steviósido Puro",
      cal_100g: 0,
      grasasTotales_100g: 0,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0,
      proteinas_100g: 0,
      carbohidratos_100g: 0,
      sodio_100g: 0,
      fibra_100g: 0,
      otro_100g: 100,
    },
    {
      nombre: "Sucralosa",
      cal_100g: 0,
      grasasTotales_100g: 0,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0,
      proteinas_100g: 0,
      carbohidratos_100g: 0,
      sodio_100g: 0,
      fibra_100g: 0,
      otro_100g: 100,
    },
    {
      nombre: "Tomate en Polvo (imp. premium)",
      cal_100g: 330,
      grasasTotales_100g: 2,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.5,
      proteinas_100g: 14,
      carbohidratos_100g: 70,
      sodio_100g: 0.02,
      fibra_100g: 10,
      otro_100g: 3,
    },
    {
      nombre: "Tomillo",
      cal_100g: 270,
      grasasTotales_100g: 7,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 1,
      proteinas_100g: 9,
      carbohidratos_100g: 60,
      sodio_100g: 0.02,
      fibra_100g: 38,
      otro_100g: 3,
    },
    {
      nombre: "Xilitol",
      cal_100g: 240,
      grasasTotales_100g: 0,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0,
      proteinas_100g: 0,
      carbohidratos_100g: 99,
      sodio_100g: 0.01,
      fibra_100g: 0,
      otro_100g: 1,
    },
    {
      nombre: "Zanahoria Deshidratada",
      cal_100g: 320,
      grasasTotales_100g: 1,
      grasasTrans_100g: 0,
      grasasSaturadas_100g: 0.1,
      proteinas_100g: 8,
      carbohidratos_100g: 80,
      sodio_100g: 0.02,
      fibra_100g: 25,
      otro_100g: 6,
    },
  ];

  await prisma.insumo.createMany({
    data: insumos,
    skipDuplicates: true,
  });

  console.log("✔ Seed ejecutado OK");

  // 5) Depósitos

  const depositos = [
    {
      nombre: "Depósito Central",
      direccion: "Av. Siempre Viva 123",
      responsable: "Juan Pérez",
      capacidadTotal: 5000,
      capacidadUsada: 0,
      estado: true, // activo
    },
    {
      nombre: "Depósito Secundario",
      direccion: "Ruta 9 Km 25",
      responsable: "María Gómez",
      capacidadTotal: 2500,
      capacidadUsada: 0,
      estado: true, // activo
    },
  ];

  for (const d of depositos) {
    await prisma.deposito.upsert({
      where: { nombre: d.nombre },
      update: { ...d },
      create: { ...d },
    });
  }

  console.log("Seed de DEPOSITOS ejecutado OK");

  // 6) Fórmulas + Productos + Inventario (umbrales)

  // ——— insumos que vamos a usar en las fórmulas
  const insumosNecesarios = [
    "Concentrado de Suero de Queso",
    "Cacao Amargo Fenix 54",
    "Sucralosa",
    "Colageno Hidrolizado (mathpro)",
    "Saborizante Frutilla",
    "Xilitol",
  ];

  // mapa nombre -> idInsumo
  const insumosDB = await prisma.insumo.findMany({
    where: { nombre: { in: insumosNecesarios } },
  });
  const insumoId: Record<string, number> = Object.fromEntries(
    insumosDB.map((i) => [i.nombre, i.id])
  );

  // (sanity check simple)
  for (const n of insumosNecesarios) {
    if (!insumoId[n])
      throw new Error(`Falta insumo en DB para la fórmula: ${n}`);
  }

  // ——— Fórmula 1: “Prote A”
  const formulaA = await prisma.formula.create({
    data: {
      nombre: "Prote A",
      porcion: 30,
      kcalorias: 120,
      kjuls: 502,
      grasaTotal: 2,
      grasaTrans: 0,
      grasaSaturada: 0.5,
      proteinas: 20,
      carbohidratos: 3,
      sodio: 0.12,
      fibra: 1,
      otros: 0,
      esProtegida: false,
      formulaInsumos: {
        create: [
          {
            idInsumo: insumoId["Concentrado de Suero de Queso"],
            cantidadInsumo: 25,
          },
          { idInsumo: insumoId["Cacao Amargo Fenix 54"], cantidadInsumo: 3 },
          { idInsumo: insumoId["Sucralosa"], cantidadInsumo: 2 },
        ],
      },
    },
  });

  // ——— Fórmula 2: “Colágeno Plus”
  const formulaB = await prisma.formula.create({
    data: {
      nombre: "Colágeno Plus",
      porcion: 10,
      kcalorias: 40,
      kjuls: 167,
      grasaTotal: 0,
      grasaTrans: 0,
      grasaSaturada: 0,
      proteinas: 9,
      carbohidratos: 1,
      sodio: 0.02,
      fibra: 0,
      otros: 0,
      esProtegida: false,
      formulaInsumos: {
        create: [
          {
            idInsumo: insumoId["Colageno Hidrolizado (mathpro)"],
            cantidadInsumo: 9,
          },
          { idInsumo: insumoId["Saborizante Frutilla"], cantidadInsumo: 0.8 },
          { idInsumo: insumoId["Xilitol"], cantidadInsumo: 0.2 },
        ],
      },
    },
  });

  // ——— Productos comerciales
  const prodA = await prisma.producto.create({
    data: {
      idFormula: formulaA.id,
      nombreComercial: "Prote A 900g",
      pesoNeto: 0.9,
      cantPorcionesAportadas: 30,
    },
  });

  const prodB = await prisma.producto.create({
    data: {
      idFormula: formulaB.id,
      nombreComercial: "Colágeno Plus 300g",
      pesoNeto: 0.3,
      cantPorcionesAportadas: 30,
    },
  });

  // ——— Inventario inicial con umbrales (por depósito x producto)
  const deps = await prisma.deposito.findMany({
    where: { nombre: { in: ["Depósito Central", "Depósito Secundario"] } },
  });
  const depId = Object.fromEntries(deps.map((d) => [d.nombre, d.id]));

  await prisma.inventario.createMany({
    data: [
      // Depósito Central
      {
        idDeposito: depId["Depósito Central"],
        idProducto: prodA.idProducto,
        cantidadProducto: 15,
        umbralMin: 10,
        umbralMax: 0,
      },
      {
        idDeposito: depId["Depósito Central"],
        idProducto: prodB.idProducto,
        cantidadProducto: 3,
        umbralMin: 8,
        umbralMax: 0,
      },
      // Depósito Secundario
      {
        idDeposito: depId["Depósito Secundario"],
        idProducto: prodA.idProducto,
        cantidadProducto: 2,
        umbralMin: 5,
        umbralMax: 0,
      },
      {
        idDeposito: depId["Depósito Secundario"],
        idProducto: prodB.idProducto,
        cantidadProducto: 10,
        umbralMin: 4,
        umbralMax: 0,
      },
    ],
    skipDuplicates: true,
  });

  console.log(
    "Seed de FORMULAS, PRODUCTOS e INVENTARIO (umbrales) ejecutado OK"
  );

  // Estados de Pedido
  const estadosPedido = [
    { nombre: "Creado" },
    { nombre: "EnElaboración" },
    { nombre: "ElaboradoYDepositadoEnFábrica" },
    { nombre: "Cancelado" },
  ];

  // En reset de desarrollo la tabla está vacía, creamos en bloque
  await prisma.estadoPedido.createMany({ data: estadosPedido });

  // Depósito “Fábrica” (si no existe)
  await prisma.deposito.upsert({
    where: { nombre: "Fábrica" },
    update: {},
    create: {
      nombre: "Fábrica",
      direccion: "No especificada",
      responsable: "Sistema",
      capacidadTotal: 100000,
      capacidadUsada: 0,
      estado: true,
    },
  });

  // 7) Pedidos de ejemplo con estados
  // Helper: redondeo a 4 decimales
  const round4 = (n: number) => Math.round(n * 10000) / 10000;

  // Obtener IDs de estados
  const estados = await prisma.estadoPedido.findMany({
    where: {
      nombre: {
        in: [
          "Creado",
          "EnElaboración",
          "ElaboradoYDepositadoEnFábrica",
          "Cancelado",
        ],
      },
    },
  });
  const estadoIdByName = Object.fromEntries(
    estados.map((e) => [e.nombre, e.id])
  );
  const creadoId = estadoIdByName["Creado"];
  const enElabId = estadoIdByName["EnElaboración"];
  const elaboradoId = estadoIdByName["ElaboradoYDepositadoEnFábrica"];
  const canceladoId = estadoIdByName["Cancelado"];

  if (!creadoId || !enElabId || !elaboradoId || !canceladoId) {
    throw new Error("Faltan estados de pedido para el seed");
  }

  // Recuperar productos con sus fórmulas para conversiones (no nulos)
  const productoAFull = await prisma.producto.findUniqueOrThrow({
    where: { idProducto: prodA.idProducto },
    include: { formula: true },
  });
  const productoBFull = await prisma.producto.findUniqueOrThrow({
    where: { idProducto: prodB.idProducto },
    include: { formula: true },
  });

  if (!productoAFull.formula || !productoBFull.formula) {
    throw new Error("Productos o fórmulas no disponibles para seed de pedidos");
  }

  // Tipo mínimo necesario para las conversiones y creación
  type ProductoSeed = {
    idProducto: number;
    pesoNeto: number;
    formula: { porcion: number };
  };
  const productoA: ProductoSeed = {
    idProducto: productoAFull.idProducto,
    pesoNeto: productoAFull.pesoNeto,
    formula: { porcion: productoAFull.formula!.porcion },
  };
  const productoB: ProductoSeed = {
    idProducto: productoBFull.idProducto,
    pesoNeto: productoBFull.pesoNeto,
    formula: { porcion: productoBFull.formula!.porcion },
  };

  // Helper para convertir cantidades similar al servicio
  function convertirCantidades(
    {
      gramos,
      paquetes,
      porciones,
    }: { gramos?: number; paquetes?: number; porciones?: number },
    producto: ProductoSeed
  ) {
    const pesoPaquete = Number(producto.pesoNeto);
    const porcion = Number(producto.formula.porcion);
    let g = gramos,
      pqt = paquetes,
      por = porciones;
    const hasG = typeof g === "number" && g > 0;
    const hasPqt = typeof pqt === "number" && pqt > 0;
    const hasPor = typeof por === "number" && por > 0;
    if (hasG) {
      pqt = round4(g! / pesoPaquete);
      por = round4(g! / porcion);
    } else if (hasPqt) {
      g = round4(pqt! * pesoPaquete);
      por = round4(g / porcion);
    } else if (hasPor) {
      g = round4(por! * porcion);
      pqt = round4(g / pesoPaquete);
    } else {
      throw new Error("Cantidades inválidas en seed");
    }
    return {
      cantAProducir_gramos: g!,
      cantAProducir_paquetes: pqt!,
      cantAProducir_porciones: por!,
    };
  }

  // Helper para crear pedido y su(s) cambio(s) de estado en transacción
  async function crearPedidoConEstado({
    producto,
    cantidades,
    creador,
    objetivo,
    cocinero,
    observacion,
  }: {
    producto: ProductoSeed;
    cantidades: { gramos?: number; paquetes?: number; porciones?: number };
    creador: { mail: string; idPerfil: number };
    objetivo:
      | "Creado"
      | "EnElaboración"
      | "ElaboradoYDepositadoEnFábrica"
      | "Cancelado";
    cocinero?: { mail: string; idPerfil: number };
    observacion?: string;
  }) {
    await prisma.$transaction(async (tx) => {
      const conv = convertirCantidades(cantidades, producto);
      const pedido = await tx.pedido.create({
        data: {
          idProducto: producto.idProducto,
          ...conv,
          observacion: observacion ?? null,
          mailUsuarioCreador: creador.mail,
          idPerfilCreador: creador.idPerfil,
          estaAsignado: false,
        },
      });

      // Estado Creado (siempre)
      const cambioCreado = await tx.cambioEstadoPedido.create({
        data: {
          idPedido: pedido.numPedido,
          idEstadoPedido: creadoId,
          fechaHoraInicio: new Date(),
        },
      });
      await tx.pedido.update({
        where: { numPedido: pedido.numPedido },
        data: { idCambioEstadoPedido: cambioCreado.idCambioEstado },
      });

      if (objetivo === "Creado") return;

      // Transición a EnElaboración
      const ahora = new Date();
      await tx.cambioEstadoPedido.update({
        where: { idCambioEstado: cambioCreado.idCambioEstado },
        data: { fechaHoraFin: ahora },
      });
      const cambioEnElab = await tx.cambioEstadoPedido.create({
        data: {
          idPedido: pedido.numPedido,
          idEstadoPedido: enElabId,
          fechaHoraInicio: ahora,
        },
      });
      await tx.pedido.update({
        where: { numPedido: pedido.numPedido },
        data: {
          idCambioEstadoPedido: cambioEnElab.idCambioEstado,
          estaAsignado: !!cocinero,
          mailUsuarioCocinero: cocinero?.mail ?? null,
          idPerfilCocinero: cocinero?.idPerfil ?? null,
        },
      });

      if (objetivo === "EnElaboración") return;

      if (objetivo === "Cancelado") {
        // Cancelar desde EnElaboración
        const t2 = new Date();
        await tx.cambioEstadoPedido.update({
          where: { idCambioEstado: cambioEnElab.idCambioEstado },
          data: { fechaHoraFin: t2 },
        });
        const cambioCancel = await tx.cambioEstadoPedido.create({
          data: {
            idPedido: pedido.numPedido,
            idEstadoPedido: canceladoId,
            fechaHoraInicio: t2,
          },
        });
        await tx.pedido.update({
          where: { numPedido: pedido.numPedido },
          data: {
            idCambioEstadoPedido: cambioCancel.idCambioEstado,
            estaAsignado: false,
          },
        });
        return;
      }

      // Elaborado y depositado en fábrica
      const t3 = new Date();
      await tx.cambioEstadoPedido.update({
        where: { idCambioEstado: cambioEnElab.idCambioEstado },
        data: { fechaHoraFin: t3 },
      });
      const cambioElab = await tx.cambioEstadoPedido.create({
        data: {
          idPedido: pedido.numPedido,
          idEstadoPedido: elaboradoId,
          fechaHoraInicio: t3,
        },
      });
      await tx.pedido.update({
        where: { numPedido: pedido.numPedido },
        data: { idCambioEstadoPedido: cambioElab.idCambioEstado },
      });
    });
  }

  // Crear algunos pedidos
  await crearPedidoConEstado({
    producto: productoA,
    cantidades: { gramos: 300 },
    creador: { mail: "tecnico@aip.com", idPerfil: 1 },
    objetivo: "Creado",
    observacion: "Semilla: pedido creado",
  });

  await crearPedidoConEstado({
    producto: productoA,
    cantidades: { paquetes: 10 },
    creador: { mail: "tecnico@aip.com", idPerfil: 1 },
    objetivo: "EnElaboración",
    cocinero: { mail: "adminfab@aip.com", idPerfil: 2 },
    observacion: "Semilla: en elaboración",
  });

  await crearPedidoConEstado({
    producto: productoB,
    cantidades: { porciones: 30 },
    creador: { mail: "tecnico@aip.com", idPerfil: 1 },
    objetivo: "ElaboradoYDepositadoEnFábrica",
    cocinero: { mail: "adminfab@aip.com", idPerfil: 2 },
    observacion: "Semilla: elaborado",
  });

  await crearPedidoConEstado({
    producto: productoB,
    cantidades: { gramos: 150 },
    creador: { mail: "tecnico@aip.com", idPerfil: 1 },
    objetivo: "Cancelado",
    cocinero: { mail: "adminfab@aip.com", idPerfil: 2 },
    observacion: "Semilla: cancelado",
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
