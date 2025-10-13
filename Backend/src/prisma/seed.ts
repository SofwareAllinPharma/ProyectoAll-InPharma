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

  const plain = process.env.SEED_DEFAULT_PASSWORD
  if (!plain) {
    console.log('SEED_DEFAULT_PASSWORD no definida: omito creación/actualización de usuarios.')
  }

  const hash = plain ? await bcrypt.hash(plain, 10) : null
  const usuarios = [
    { mail: 'adminfab@aip.com',              idPerfil: 2 },
    { mail: 'adminsis@aip.com',              idPerfil: 3 },
    { mail: 'softwareallinpharma@gmail.com', idPerfil: 3 },
    { mail: 'tecnico@aip.com',               idPerfil: 1 },
  ]

  if (hash) {
    for (const u of usuarios) {
      await prisma.usuario.upsert({
        where: { mail: u.mail },
        update: { contrasena: hash }, // Prisma -> columna "contraseña"
        create: { mail: u.mail, contrasena: hash },
      })
    }

    // 3) Relación Usuario-Perfil (clave compuesta)
    await prisma.usuarioPerfil.createMany({
      data: usuarios.map(u => ({ mail: u.mail, idPerfil: u.idPerfil })),
      skipDuplicates: true,
    })
  }

  // 4) Insumos
  const insumos = [
    { nombre: 'Aceite de Coco', cal_100g: 900, grasasTotales_100g: 100, grasasTrans_100g: 0, grasasSaturadas_100g: 90, proteinas_100g: 0, carbohidratos_100g: 0, sodio_100g: 0, fibra_100g: 0, otro_100g: 0 },
    { nombre: 'Ajo en Polvo (imp. premium)', cal_100g: 330, grasasTotales_100g: 0.7, grasasTrans_100g: 0, grasasSaturadas_100g: 0.1, proteinas_100g: 16, carbohidratos_100g: 72, sodio_100g: 0.1, fibra_100g: 9, otro_100g: 2 },
    { nombre: 'Albahaca deshidratada', cal_100g: 250, grasasTotales_100g: 4, grasasTrans_100g: 0, grasasSaturadas_100g: 0.5, proteinas_100g: 23, carbohidratos_100g: 60, sodio_100g: 0.05, fibra_100g: 37, otro_100g: 5 },
    { nombre: 'Albúmina de Huevo', cal_100g: 380, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0.2, proteinas_100g: 80, carbohidratos_100g: 8, sodio_100g: 0.2, fibra_100g: 0, otro_100g: 10 },
    { nombre: 'Almendras', cal_100g: 580, grasasTotales_100g: 50, grasasTrans_100g: 0, grasasSaturadas_100g: 4, proteinas_100g: 21, carbohidratos_100g: 22, sodio_100g: 0.01, fibra_100g: 12, otro_100g: 5 },
    { nombre: 'Arroz Crocante', cal_100g: 400, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0.3, proteinas_100g: 7, carbohidratos_100g: 86, sodio_100g: 0.01, fibra_100g: 1, otro_100g: 4 },
    { nombre: 'Avena', cal_100g: 370, grasasTotales_100g: 7, grasasTrans_100g: 0, grasasSaturadas_100g: 1, proteinas_100g: 13, carbohidratos_100g: 68, sodio_100g: 0.005, fibra_100g: 10, otro_100g: 2 },
    { nombre: 'Berenjena Deshidratada', cal_100g: 250, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0.1, proteinas_100g: 10, carbohidratos_100g: 60, sodio_100g: 0.01, fibra_100g: 25, otro_100g: 5 },
    { nombre: 'Cacao Amargo Fenix 54', cal_100g: 240, grasasTotales_100g: 14, grasasTrans_100g: 0, grasasSaturadas_100g: 8, proteinas_100g: 20, carbohidratos_100g: 22, sodio_100g: 0.02, fibra_100g: 30, otro_100g: 5 },
    { nombre: 'Cacao Amargo Fenix 56', cal_100g: 240, grasasTotales_100g: 14, grasasTrans_100g: 0, grasasSaturadas_100g: 8, proteinas_100g: 20, carbohidratos_100g: 22, sodio_100g: 0.02, fibra_100g: 30, otro_100g: 5 },
    { nombre: 'Café Instantáneo', cal_100g: 200, grasasTotales_100g: 0, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 12, carbohidratos_100g: 70, sodio_100g: 0.02, fibra_100g: 3, otro_100g: 5 },
    { nombre: 'Cebolla en Polvo', cal_100g: 350, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0.2, proteinas_100g: 10, carbohidratos_100g: 80, sodio_100g: 0.05, fibra_100g: 6, otro_100g: 3 },
    { nombre: 'Cloruro de Sodio', cal_100g: 0, grasasTotales_100g: 0, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 0, carbohidratos_100g: 0, sodio_100g: 39, fibra_100g: 0, otro_100g: 61 },
    { nombre: 'Colageno Hidrolizado (mathpro)', cal_100g: 370, grasasTotales_100g: 0, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 90, carbohidratos_100g: 0, sodio_100g: 0, fibra_100g: 0, otro_100g: 10 },
    { nombre: 'Concentrado de Suero de Queso', cal_100g: 380, grasasTotales_100g: 3, grasasTrans_100g: 0, grasasSaturadas_100g: 1, proteinas_100g: 80, carbohidratos_100g: 8, sodio_100g: 0.05, fibra_100g: 0, otro_100g: 8 },
    { nombre: 'Curcuma (Callieri)', cal_100g: 300, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0.2, proteinas_100g: 10, carbohidratos_100g: 65, sodio_100g: 0.01, fibra_100g: 22, otro_100g: 2 },
    { nombre: 'Dextrosa', cal_100g: 370, grasasTotales_100g: 0, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 0, carbohidratos_100g: 92, sodio_100g: 0.01, fibra_100g: 0, otro_100g: 8 },
    { nombre: 'DDL Polvo HIS ESTABON COMPLEX DOL', cal_100g: 420, grasasTotales_100g: 8, grasasTrans_100g: 0, grasasSaturadas_100g: 2, proteinas_100g: 5, carbohidratos_100g: 82, sodio_100g: 0.2, fibra_100g: 1, otro_100g: 2 },
    { nombre: 'Espinaca deshidratada (en escamas)', cal_100g: 270, grasasTotales_100g: 3, grasasTrans_100g: 0, grasasSaturadas_100g: 0.5, proteinas_100g: 25, carbohidratos_100g: 40, sodio_100g: 0.02, fibra_100g: 30, otro_100g: 2 },
    { nombre: 'Expandido de Maíz Tipo Copo', cal_100g: 380, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0.2, proteinas_100g: 7, carbohidratos_100g: 85, sodio_100g: 0.01, fibra_100g: 2, otro_100g: 5 },
    { nombre: 'Germen de Trigo', cal_100g: 350, grasasTotales_100g: 9, grasasTrans_100g: 0, grasasSaturadas_100g: 1.5, proteinas_100g: 25, carbohidratos_100g: 50, sodio_100g: 0.02, fibra_100g: 14, otro_100g: 1 },
    { nombre: 'Jugo de Frutilla en Polvo', cal_100g: 380, grasasTotales_100g: 0, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 0, carbohidratos_100g: 95, sodio_100g: 0.01, fibra_100g: 0, otro_100g: 5 },
    { nombre: 'Lecitina de Soja', cal_100g: 700, grasasTotales_100g: 70, grasasTrans_100g: 0, grasasSaturadas_100g: 15, proteinas_100g: 5, carbohidratos_100g: 5, sodio_100g: 0.01, fibra_100g: 0, otro_100g: 5 },
    { nombre: 'Levadura de Cerveza', cal_100g: 350, grasasTotales_100g: 5, grasasTrans_100g: 0, grasasSaturadas_100g: 1, proteinas_100g: 40, carbohidratos_100g: 40, sodio_100g: 0.02, fibra_100g: 20, otro_100g: 3 },
    { nombre: 'Maltodextrinas', cal_100g: 380, grasasTotales_100g: 0, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 0, carbohidratos_100g: 95, sodio_100g: 0.01, fibra_100g: 0, otro_100g: 5 },
    { nombre: 'Nueces', cal_100g: 650, grasasTotales_100g: 65, grasasTrans_100g: 0, grasasSaturadas_100g: 6, proteinas_100g: 15, carbohidratos_100g: 14, sodio_100g: 0.01, fibra_100g: 7, otro_100g: 2 },
    { nombre: 'Pasas de Uva', cal_100g: 300, grasasTotales_100g: 0.5, grasasTrans_100g: 0, grasasSaturadas_100g: 0.1, proteinas_100g: 3, carbohidratos_100g: 79, sodio_100g: 0.01, fibra_100g: 4, otro_100g: 13 },
    { nombre: 'Perejil Deshidratado', cal_100g: 270, grasasTotales_100g: 4, grasasTrans_100g: 0, grasasSaturadas_100g: 0.5, proteinas_100g: 22, carbohidratos_100g: 50, sodio_100g: 0.02, fibra_100g: 27, otro_100g: 3 },
    { nombre: 'Pimentón Extra Callieri', cal_100g: 320, grasasTotales_100g: 13, grasasTrans_100g: 0, grasasSaturadas_100g: 2, proteinas_100g: 14, carbohidratos_100g: 50, sodio_100g: 0.02, fibra_100g: 35, otro_100g: 1 },
    { nombre: 'Proteína de Leche (suero)', cal_100g: 380, grasasTotales_100g: 2, grasasTrans_100g: 0, grasasSaturadas_100g: 1, proteinas_100g: 80, carbohidratos_100g: 8, sodio_100g: 0.05, fibra_100g: 0, otro_100g: 10 },
    { nombre: 'Proteínas de Soja', cal_100g: 360, grasasTotales_100g: 7, grasasTrans_100g: 0, grasasSaturadas_100g: 1, proteinas_100g: 50, carbohidratos_100g: 35, sodio_100g: 0.01, fibra_100g: 8, otro_100g: 1 },
    { nombre: 'Puerro en Trozos Deshidratado', cal_100g: 290, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0.2, proteinas_100g: 10, carbohidratos_100g: 70, sodio_100g: 0.02, fibra_100g: 25, otro_100g: 4 },
    { nombre: 'His Estabon Complex Parm', cal_100g: 420, grasasTotales_100g: 10, grasasTrans_100g: 0, grasasSaturadas_100g: 3, proteinas_100g: 10, carbohidratos_100g: 75, sodio_100g: 0.2, fibra_100g: 0, otro_100g: 2 },
    { nombre: 'Romero', cal_100g: 330, grasasTotales_100g: 15, grasasTrans_100g: 0, grasasSaturadas_100g: 2, proteinas_100g: 4, carbohidratos_100g: 65, sodio_100g: 0.02, fibra_100g: 43, otro_100g: 1 },
    { nombre: 'Saborizante Chocolate rbp 10845', cal_100g: 380, grasasTotales_100g: 5, grasasTrans_100g: 0, grasasSaturadas_100g: 1, proteinas_100g: 0, carbohidratos_100g: 90, sodio_100g: 0.01, fibra_100g: 0, otro_100g: 4 },
    { nombre: 'Saborizante Cuatro Quesos', cal_100g: 390, grasasTotales_100g: 8, grasasTrans_100g: 0, grasasSaturadas_100g: 2, proteinas_100g: 5, carbohidratos_100g: 80, sodio_100g: 0.2, fibra_100g: 0, otro_100g: 5 },
    { nombre: 'Saborizante DDL rbp 10046', cal_100g: 400, grasasTotales_100g: 7, grasasTrans_100g: 0, grasasSaturadas_100g: 2, proteinas_100g: 3, carbohidratos_100g: 82, sodio_100g: 0.1, fibra_100g: 0, otro_100g: 6 },
    { nombre: 'Saborizante Frutilla', cal_100g: 380, grasasTotales_100g: 0.5, grasasTrans_100g: 0, grasasSaturadas_100g: 0.1, proteinas_100g: 0, carbohidratos_100g: 94, sodio_100g: 0.01, fibra_100g: 0, otro_100g: 5 },
    { nombre: 'Saborizante Queso Parmesano', cal_100g: 390, grasasTotales_100g: 10, grasasTrans_100g: 0, grasasSaturadas_100g: 3, proteinas_100g: 5, carbohidratos_100g: 78, sodio_100g: 0.2, fibra_100g: 0, otro_100g: 4 },
    { nombre: 'Salvado de Avena', cal_100g: 310, grasasTotales_100g: 6, grasasTrans_100g: 0, grasasSaturadas_100g: 1, proteinas_100g: 16, carbohidratos_100g: 60, sodio_100g: 0.01, fibra_100g: 25, otro_100g: 2 },
    { nombre: 'Semilla de Lino Molida', cal_100g: 530, grasasTotales_100g: 42, grasasTrans_100g: 0, grasasSaturadas_100g: 4, proteinas_100g: 18, carbohidratos_100g: 29, sodio_100g: 0.02, fibra_100g: 27, otro_100g: 1 },
    { nombre: 'Steviósido Puro', cal_100g: 0, grasasTotales_100g: 0, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 0, carbohidratos_100g: 0, sodio_100g: 0, fibra_100g: 0, otro_100g: 100 },
    { nombre: 'Sucralosa', cal_100g: 0, grasasTotales_100g: 0, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 0, carbohidratos_100g: 0, sodio_100g: 0, fibra_100g: 0, otro_100g: 100 },
    { nombre: 'Tomate en Polvo (imp. premium)', cal_100g: 330, grasasTotales_100g: 2, grasasTrans_100g: 0, grasasSaturadas_100g: 0.5, proteinas_100g: 14, carbohidratos_100g: 70, sodio_100g: 0.02, fibra_100g: 10, otro_100g: 3 },
    { nombre: 'Tomillo', cal_100g: 270, grasasTotales_100g: 7, grasasTrans_100g: 0, grasasSaturadas_100g: 1, proteinas_100g: 9, carbohidratos_100g: 60, sodio_100g: 0.02, fibra_100g: 38, otro_100g: 3 },
    { nombre: 'Xilitol', cal_100g: 240, grasasTotales_100g: 0, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 0, carbohidratos_100g: 99, sodio_100g: 0.01, fibra_100g: 0, otro_100g: 1 },
    { nombre: 'Zanahoria Deshidratada', cal_100g: 320, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0.1, proteinas_100g: 8, carbohidratos_100g: 80, sodio_100g: 0.02, fibra_100g: 25, otro_100g: 6 },
  ]

  await prisma.insumo.createMany({
    data: insumos,
    skipDuplicates: true,
  })

  console.log('✔ Seed ejecutado OK')

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
  'Concentrado de Suero de Queso',
  'Cacao Amargo Fenix 54',
  'Sucralosa',
  'Colageno Hidrolizado (mathpro)',
  'Saborizante Frutilla',
  'Xilitol',
];

// mapa nombre -> idInsumo
const insumosDB = await prisma.insumo.findMany({
  where: { nombre: { in: insumosNecesarios } },
});
const insumoId: Record<string, number> = Object.fromEntries(
  insumosDB.map(i => [i.nombre, i.id])
);

// (sanity check simple)
for (const n of insumosNecesarios) {
  if (!insumoId[n]) throw new Error(`Falta insumo en DB para la fórmula: ${n}`);
}

// ——— Fórmula 1: “Prote A”
const formulaA = await prisma.formula.upsert({
  where: { nombre: 'Prote A' },
  update: {},
  create: {
    nombre: 'Prote A',
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
        { idInsumo: insumoId['Concentrado de Suero de Queso'], cantidadInsumo: 25 },
        { idInsumo: insumoId['Cacao Amargo Fenix 54'],        cantidadInsumo: 3  },
        { idInsumo: insumoId['Sucralosa'],                    cantidadInsumo: 2  },
      ],
    },
  },
});

// ——— Fórmula 2: “Colágeno Plus”
const formulaB = await prisma.formula.upsert({
  where: { nombre: 'Colágeno Plus' },
  update: {},
  create: {
    nombre: 'Colágeno Plus',
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
        { idInsumo: insumoId['Colageno Hidrolizado (mathpro)'], cantidadInsumo: 9  },
        { idInsumo: insumoId['Saborizante Frutilla'],           cantidadInsumo: 0.8 },
        { idInsumo: insumoId['Xilitol'],                         cantidadInsumo: 0.2 },
      ],
    },
  },
});

// ——— Productos comerciales
const prodA = await prisma.producto.upsert({
  where: { nombreComercial: 'Prote A 900g' },
  update: {},
  create: {
    idFormula: formulaA.id,
    nombreComercial: 'Prote A 900g',
    pesoNeto: 0.9,
    cantPorcionesAportadas: 30,
  },
});

const prodB = await prisma.producto.upsert({
  where: { nombreComercial: 'Colágeno Plus 300g' },
  update: {},
  create: {
    idFormula: formulaB.id,
    nombreComercial: 'Colágeno Plus 300g',
    pesoNeto: 0.3,
    cantPorcionesAportadas: 30,
  },
});

// ——— Inventario inicial con umbrales (por depósito x producto)
const deps = await prisma.deposito.findMany({
  where: { nombre: { in: ['Depósito Central', 'Depósito Secundario'] } },
});
const depId = Object.fromEntries(deps.map(d => [d.nombre, d.id]));

await prisma.inventario.createMany({
  data: [
    // Depósito Central
    { idDeposito: depId['Depósito Central'],  idProducto: prodA.idProducto, cantidadProducto: 15, umbralMin: 10, umbralMax: 0 },
    { idDeposito: depId['Depósito Central'],  idProducto: prodB.idProducto, cantidadProducto: 3, umbralMin:  8, umbralMax: 0 },
    // Depósito Secundario
    { idDeposito: depId['Depósito Secundario'], idProducto: prodA.idProducto, cantidadProducto: 2, umbralMin: 5, umbralMax: 0 },
    { idDeposito: depId['Depósito Secundario'], idProducto: prodB.idProducto, cantidadProducto: 10, umbralMin: 4, umbralMax:  0 },
  ],
  skipDuplicates: true,
});

console.log('Seed de FORMULAS, PRODUCTOS e INVENTARIO (umbrales) ejecutado OK');


}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
