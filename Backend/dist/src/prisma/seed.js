"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
let bcrypt;
try {
    bcrypt = require("bcryptjs");
}
catch (e) {
    bcrypt = require("bcrypt");
}
const prisma = new client_1.PrismaClient();
async function main() {
    const perfiles = [
        { id: 1, nombre: 'tecnico', descripcion: 'tecnico' },
        { id: 2, nombre: 'adminfab', descripcion: 'administrador de fabrica' },
        { id: 3, nombre: 'adminsis', descripcion: 'administrador del sistema' },
    ];
    for (const p of perfiles) {
        await prisma.perfil.upsert({
            where: { id: p.id },
            update: { nombre: p.nombre, descripcion: p.descripcion ?? null },
            create: p,
        });
    }
    console.log('✔ Seed de PERFILES ejecutado OK');
    const plain = process.env.SEED_DEFAULT_PASSWORD ?? "admin2025";
    if (!process.env.SEED_DEFAULT_PASSWORD) {
        console.log("SEED_DEFAULT_PASSWORD no definida: usando contraseña por defecto para usuarios de seed.");
    }
    const hash = await bcrypt.hash(plain, 10);
    const usuarios = [
        { mail: 'adminfab@aip.com', idPerfil: 2 },
        { mail: 'adminsis@aip.com', idPerfil: 3 },
        { mail: 'softwareallinpharma@gmail.com', idPerfil: 3 },
        { mail: 'tecnico@aip.com', idPerfil: 1 },
    ];
    for (const u of usuarios) {
        await prisma.usuario.upsert({
            where: { mail: u.mail },
            update: { contrasena: hash }, // Prisma -> columna "contraseña"
            create: { mail: u.mail, contrasena: hash },
        });
    }
    await prisma.usuarioPerfil.createMany({
        data: usuarios.map(u => ({ mail: u.mail, idPerfil: u.idPerfil })),
        skipDuplicates: true,
    });
    console.log('✔ Seed de USUARIOS y USUARIOxPERFIL ejecutado OK');
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
    ];
    await prisma.insumo.createMany({
        data: insumos,
        skipDuplicates: true,
    });
    console.log('✔ Seed de INSUMOS ejecutado OK');
    const depositos = [
        {
            nombre: "Depósito Central",
            direccion: "Av. Siempre Viva 123",
            responsable: "Juan Pérez",
            capacidadTotal: 2000,
            capacidadUsada: 0,
            estado: true,
        },
        {
            nombre: "Fábrica",
            direccion: "No especificada",
            responsable: "Sistema",
            capacidadTotal: 5000,
            capacidadUsada: 0,
            estado: true,
            esProtegido: true,
        },
    ];
    for (const d of depositos) {
        await prisma.deposito.upsert({
            where: { nombre: d.nombre },
            update: { ...d },
            create: { ...d },
        });
    }
    console.log("Seed de DEPOSITOS ejecutado OK (2 en total)");
    const insumosNecesariosGlobal = [
        'Concentrado de Suero de Queso', 'Cacao Amargo Fenix 54', 'Sucralosa',
        'Colageno Hidrolizado (mathpro)', 'Saborizante Frutilla', 'Xilitol',
        'Proteínas de Soja', 'Saborizante Cuatro Quesos', 'Cebolla en Polvo',
        'Perejil Deshidratado', 'Aceite de Coco', 'Saborizante Chocolate rbp 10845',
        'Albúmina de Huevo', 'Café Instantáneo', 'Maltodextrinas',
        'Cloruro de Sodio', 'Pimentón Extra Callieri', 'Tomate en Polvo (imp. premium)',
        'Arroz Crocante', 'Avena', 'Salvado de Avena', 'Curcuma (Callieri)', 'Romero',
        'Saborizante DDL rbp 10046',
        'Steviósido Puro',
        'Dextrosa',
        'DDL Polvo HIS ESTABON COMPLEX DOL',
        'Tomillo',
        'Saborizante Queso Parmesano',
        'Semilla de Lino Molida',
    ];
    const insumosDB = await prisma.insumo.findMany({
        where: { nombre: { in: insumosNecesariosGlobal } },
    });
    const insumoId = Object.fromEntries(insumosDB.map(i => [i.nombre, i.id]));
    for (const n of insumosNecesariosGlobal) {
        if (!insumoId[n])
            throw new Error(`ERROR FATAL: El insumo "${n}" no se encontró en la base de datos. Deteniendo el seed.`);
    }
    const seedProduct = async (formulaName, insumos, porcion, kcal, peso, porciones, productName) => {
        const formulaData = await prisma.formula.upsert({
            where: { nombre: formulaName },
            update: {
                formulaInsumos: {
                    deleteMany: {},
                    create: insumos.map(i => ({
                        idInsumo: insumoId[i.nombre],
                        cantidadInsumo: i.cantidad
                    })),
                }
            },
            create: {
                nombre: formulaName,
                porcion: porcion,
                kcalorias: kcal,
                kjuls: kcal * 4.184,
                grasaTotal: 0, grasaTrans: 0, grasaSaturada: 0, proteinas: 0,
                carbohidratos: 0, sodio: 0, fibra: 0, otros: 0,
                esProtegida: false,
                formulaInsumos: {
                    create: insumos.map(i => ({
                        idInsumo: insumoId[i.nombre],
                        cantidadInsumo: i.cantidad
                    })),
                },
            },
        });
        const productoData = await prisma.producto.upsert({
            where: { nombreComercial: productName },
            update: {
                idFormula: formulaData.id,
                pesoNeto: peso,
                cantPorcionesAportadas: porciones,
            },
            create: {
                idFormula: formulaData.id,
                nombreComercial: productName,
                pesoNeto: peso,
                cantPorcionesAportadas: porciones,
            },
        });
        return productoData;
    };
    const productosParaInventario = [];
    productosParaInventario.push(await seedProduct('Prote A', [{ nombre: 'Concentrado de Suero de Queso', cantidad: 25 }, { nombre: 'Cacao Amargo Fenix 54', cantidad: 3 }, { nombre: 'Sucralosa', cantidad: 2 }], 30, 120, 0.9, 30, 'Prote A 900g'));
    productosParaInventario.push(await seedProduct('Colágeno Plus', [{ nombre: 'Colageno Hidrolizado (mathpro)', cantidad: 9 }, { nombre: 'Saborizante Frutilla', cantidad: 0.8 }, { nombre: 'Xilitol', cantidad: 0.2 }], 10, 40, 0.3, 30, 'Colágeno Plus 300g'));
    productosParaInventario.push(await seedProduct('Suplemento Vegano Salado', [{ nombre: 'Proteínas de Soja', cantidad: 40 }, { nombre: 'Saborizante Cuatro Quesos', cantidad: 5 }, { nombre: 'Cebolla en Polvo', cantidad: 3 }, { nombre: 'Perejil Deshidratado', cantidad: 2 }], 50, 180, 1.0, 20, 'Vegano Salado 1000g'));
    productosParaInventario.push(await seedProduct('Batido Energético Keto', [{ nombre: 'Aceite de Coco', cantidad: 20 }, { nombre: 'Concentrado de Suero de Queso', cantidad: 15 }, { nombre: 'Saborizante Chocolate rbp 10845', cantidad: 5 }], 40, 300, 0.4, 10, 'Keto Shake 400g'));
    productosParaInventario.push(await seedProduct('Proteína de Huevo-Café', [{ nombre: 'Albúmina de Huevo', cantidad: 30 }, { nombre: 'Café Instantáneo', cantidad: 5 }, { nombre: 'Sucralosa', cantidad: 1 }], 36, 150, 0.6, 16, 'Huevo-Café 600g'));
    productosParaInventario.push(await seedProduct('Gainer Alto Carb.', [{ nombre: 'Maltodextrinas', cantidad: 60 }, { nombre: 'Concentrado de Suero de Queso', cantidad: 20 }, { nombre: 'Saborizante DDL rbp 10046', cantidad: 3 }], 83, 340, 1.5, 18, 'Gainer XL 1.5Kg'));
    productosParaInventario.push(await seedProduct('Sal Baja en Sodio', [{ nombre: 'Cloruro de Sodio', cantidad: 10 }, { nombre: 'Steviósido Puro', cantidad: 90 }], 1, 0, 0.1, 100, 'Sal Keto 100g'));
    productosParaInventario.push(await seedProduct('Sopa de Tomate y Pimentón', [{ nombre: 'Tomate en Polvo (imp. premium)', cantidad: 40 }, { nombre: 'Pimentón Extra Callieri', cantidad: 5 }, { nombre: 'DDL Polvo HIS ESTABON COMPLEX DOL', cantidad: 5 }], 50, 160, 0.75, 15, 'Sopa Fit 750g'));
    productosParaInventario.push(await seedProduct('Snack de Arroz Croc.', [{ nombre: 'Arroz Crocante', cantidad: 90 }, { nombre: 'Saborizante Queso Parmesano', cantidad: 10 }], 40, 180, 0.2, 5, 'Snack Parm. 200g'));
    productosParaInventario.push(await seedProduct('Mix de Avena y Semillas', [{ nombre: 'Avena', cantidad: 50 }, { nombre: 'Salvado de Avena', cantidad: 30 }, { nombre: 'Semilla de Lino Molida', cantidad: 20 }], 60, 210, 0.8, 13, 'Avena Premium 800g'));
    productosParaInventario.push(await seedProduct('Bebida Anti-inflamatoria', [{ nombre: 'Curcuma (Callieri)', cantidad: 5 }, { nombre: 'Xilitol', cantidad: 2 }, { nombre: 'Saborizante Frutilla', cantidad: 1 }], 8, 30, 0.15, 18, 'Anti-Inflamatorio 150g'));
    productosParaInventario.push(await seedProduct('Aderezo de Hierbas', [{ nombre: 'Romero', cantidad: 30 }, { nombre: 'Tomillo', cantidad: 20 }, { nombre: 'Aceite de Coco', cantidad: 50 }], 15, 450, 0.1, 6, 'Aderezo Hierbas 100g'));
    for (let i = 1; i <= 11; i++) {
        const insumo1 = i % 2 === 0 ? 'Dextrosa' : 'Concentrado de Suero de Queso';
        const insumo2 = i % 3 === 0 ? 'Maltodextrinas' : 'Sucralosa';
        productosParaInventario.push(await seedProduct(`Fórmula Adicional ${i}`, [{ nombre: insumo1, cantidad: 15 + i }, { nombre: insumo2, cantidad: 5 + i }], 30 + i, 100 + i * 5, 0.5 + i * 0.1, 15 + i, `Producto Adicional ${i} ${500 + i * 100}g`));
    }
    console.log(`Seed de FORMULAS (${productosParaInventario.length} en total) y PRODUCTOS ejecutado OK`);
    const deps = await prisma.deposito.findMany({
        where: { nombre: { in: ['Depósito Central', 'Fábrica'] } },
    });
    const depId = Object.fromEntries(deps.map(d => [d.nombre, d.id]));
    const inventarioData = [];
    let initialQtyBase = 10;
    let umbralMinBase = 5;
    const umbralMaxLimite = 500;
    for (const prod of productosParaInventario) {
        const qtyCentral = Math.min(initialQtyBase * 3, umbralMaxLimite - 50);
        const umbralMaxCentral = umbralMaxLimite;
        const qtyFabrica = Math.min(initialQtyBase * 5, umbralMaxLimite);
        const umbralMaxFabrica = umbralMaxLimite;
        // Depósito Central
        inventarioData.push({
            idDeposito: depId['Depósito Central'],
            idProducto: prod.idProducto,
            cantidadProducto: qtyCentral,
            umbralMin: umbralMinBase * 2,
            umbralMax: umbralMaxCentral
        });
        inventarioData.push({
            idDeposito: depId['Fábrica'],
            idProducto: prod.idProducto,
            cantidadProducto: qtyFabrica,
            umbralMin: umbralMinBase * 3,
            umbralMax: umbralMaxFabrica
        });
        initialQtyBase = (initialQtyBase % 20) + 10;
        umbralMinBase = (umbralMinBase % 8) + 3;
    }
    await prisma.inventario.createMany({
        data: inventarioData,
        skipDuplicates: true,
    });
    console.log(`Seed de INVENTARIO (23 productos configurados en 2 depósitos con Umbral Max <= ${umbralMaxLimite}) ejecutado OK`);
    const estadoCreado = await prisma.estado_Movimiento.upsert({
        where: { nombre: 'Creado' },
        update: {},
        create: { nombre: 'Creado' },
    });
    const estadoEnCamino = await prisma.estado_Movimiento.upsert({
        where: { nombre: 'En Camino' },
        update: {},
        create: { nombre: 'En Camino' },
    });
    const estadoEntregado = await prisma.estado_Movimiento.upsert({
        where: { nombre: 'Entregado' },
        update: {},
        create: { nombre: 'Entregado' },
    });
    const estadoCancelado = await prisma.estado_Movimiento.upsert({
        where: { nombre: 'Cancelado' },
        update: {},
        create: { nombre: 'Cancelado' },
    });
    console.log('Seed de ESTADOS_MOVIMIENTO ejecutado OK');
    const tipoTraslado = await prisma.tipos_Movimiento.upsert({
        where: { nombre: 'Traslado' },
        update: {},
        create: { nombre: 'Traslado' },
    });
    const tipoEgreso = await prisma.tipos_Movimiento.upsert({
        where: { nombre: 'Egreso' },
        update: {},
        create: { nombre: 'Egreso' },
    });
    console.log("Seed de TIPOS_MOVIMIENTO ejecutado OK (Egreso y Traslado)");
    const existingMovs = await prisma.movimiento_Producto.count();
    if (existingMovs > 0) {
        console.log(`Eliminando ${existingMovs} movimientos de ejemplo existentes...`);
        await prisma.cambio_Estado_Movimiento.deleteMany({});
        await prisma.movimiento_Producto.deleteMany({});
        console.log('Movimientos de ejemplo ELIMINADOS.');
    }
    else {
        console.log('No se encontraron movimientos de ejemplo, omitiendo eliminación.');
    }
    const estadosPedido = [
        { nombre: "Creado" },
        { nombre: "EnElaboración" },
        { nombre: "ElaboradoYDepositadoEnFábrica" },
        { nombre: "Cancelado" },
    ];
    for (const est of estadosPedido) {
        await prisma.estadoPedido.upsert({
            where: { nombre: est.nombre },
            update: {},
            create: est,
        });
    }
    console.log("Seed de ESTADOS_PEDIDO ejecutado OK");
    const round4 = (n) => Math.round(n * 10000) / 10000;
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
    const estadoIdByName = Object.fromEntries(estados.map((e) => [e.nombre, e.id]));
    const creadoId = estadoIdByName["Creado"];
    const enElabId = estadoIdByName["EnElaboración"];
    const elaboradoId = estadoIdByName["ElaboradoYDepositadoEnFábrica"];
    const canceladoId = estadoIdByName["Cancelado"];
    if (!creadoId || !enElabId || !elaboradoId || !canceladoId) {
        throw new Error("Faltan estados de pedido para el seed");
    }
    const productoAFull = await prisma.producto.findUniqueOrThrow({
        where: { nombreComercial: "Prote A 900g" },
        include: { formula: true },
    });
    const productoBFull = await prisma.producto.findUniqueOrThrow({
        where: { nombreComercial: "Colágeno Plus 300g" },
        include: { formula: true },
    });
    if (!productoAFull.formula || !productoBFull.formula) {
        throw new Error("Productos o fórmulas no disponibles para seed de pedidos");
    }
    const productoA = {
        idProducto: productoAFull.idProducto,
        pesoNeto: productoAFull.pesoNeto,
        formula: { porcion: productoAFull.formula.porcion },
    };
    const productoB = {
        idProducto: productoBFull.idProducto,
        pesoNeto: productoBFull.pesoNeto,
        formula: { porcion: productoBFull.formula.porcion },
    };
    function convertirCantidades({ gramos, paquetes, porciones, }, producto) {
        const pesoPaquete = Number(producto.pesoNeto);
        const porcion = Number(producto.formula.porcion);
        let g = gramos, pqt = paquetes, por = porciones;
        const hasG = typeof g === "number" && g > 0;
        const hasPqt = typeof pqt === "number" && pqt > 0;
        const hasPor = typeof por === "number" && por > 0;
        if (hasG) {
            pqt = round4(g / pesoPaquete);
            por = round4(g / porcion);
        }
        else if (hasPqt) {
            g = round4(pqt * pesoPaquete);
            por = round4(g / porcion);
        }
        else if (hasPor) {
            g = round4(por * porcion);
            pqt = round4(g / pesoPaquete);
        }
        else {
            throw new Error("Cantidades inválidas en seed");
        }
        return {
            cantAProducir_gramos: g,
            cantAProducir_paquetes: pqt,
            cantAProducir_porciones: por,
        };
    }
    async function crearPedidoConEstado({ producto, cantidades, creador, objetivo, cocinero, observacion, }) {
        const pedidosAnteriores = await prisma.pedido.findMany({
            where: { idProducto: producto.idProducto, observacion: observacion }
        });
        if (pedidosAnteriores.length > 0) {
            await prisma.cambioEstadoPedido.deleteMany({
                where: { idPedido: { in: pedidosAnteriores.map(p => p.numPedido) } }
            });
            await prisma.pedido.deleteMany({
                where: { numPedido: { in: pedidosAnteriores.map(p => p.numPedido) } }
            });
        }
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
            if (objetivo === "Creado")
                return;
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
            if (objetivo === "EnElaboración")
                return;
            if (objetivo === "Cancelado") {
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
    console.log("Seed de PEDIDOS de ejemplo ejecutado OK");
    console.log('✔ Seed de FUSIÓN ejecutado OK');
}
main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
    console.error("Error durante el seed:");
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
