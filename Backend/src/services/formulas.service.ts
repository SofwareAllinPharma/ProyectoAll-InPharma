import { FormulasRepository } from "../repositories/formulas.repository";
import { prisma } from "../lib/prisma";

type NutrienteKey =
  | "grasaTotal"
  | "grasaTrans"
  | "grasaSaturada"
  | "proteinas"
  | "carbohidratos"
  | "sodio"
  | "fibra"
  | "otros";

function round(num: number) {
  return Math.round(num * 10000) / 10000;
}

export class FormulasService {
  repo = new FormulasRepository();

  async list(params: { estado?: string; search?: string }) {
    return this.repo.findAll(params);
  }

  async detail(id: number) {
    return this.repo.findById(id);
  }

  async createFormula(dto: any) {
    // Validación: no permitir insumos repetidos
    const insumoIds = dto.insumos.map((i: any) => i.idInsumo);
    const insumoSet = new Set(insumoIds);
    if (insumoIds.length !== insumoSet.size) {
      throw new Error(
        "No se puede agregar el mismo insumo más de una vez en la fórmula."
      );
    }

    // Validación de nombre único solo entre fórmulas activas
    const nombreExistente = await prisma.formula.findFirst({
      where: {
        nombre: { equals: dto.nombre, mode: "insensitive" },
        activo: true, // Solo valida contra fórmulas activas
      },
    });
    if (nombreExistente) throw new Error("El nombre de la fórmula ya existe");

    // Validaciones
    if (!dto.nombre || typeof dto.nombre !== "string" || !dto.nombre.trim()) {
      throw new Error("El nombre es obligatorio");
    }

    if (!Array.isArray(dto.insumos) || dto.insumos.length === 0) {
      throw new Error("Debes agregar al menos un insumo a la fórmula");
    }

    // Obtener insumos y calcular nutrientes
    const insumosIds = dto.insumos.map((i: any) => i.idInsumo);
    const insumos = await prisma.insumo.findMany({
      where: { id: { in: insumosIds }, activo: true },
    });

    // Calcular porción como suma de cantidades
    const porcion = dto.insumos.reduce(
      (acc: number, curr: any) => acc + Number(curr.cantidadInsumo),
      0
    );
    if (porcion <= 0)
      throw new Error("La porción calculada debe ser mayor a 0");

    let nutrientes: Record<NutrienteKey, number> = {
      grasaTotal: 0,
      grasaTrans: 0,
      grasaSaturada: 0,
      proteinas: 0,
      carbohidratos: 0,
      sodio: 0,
      fibra: 0,
      otros: 0,
    };

    for (const fi of dto.insumos) {
      const insumo = insumos.find((i) => i.id === fi.idInsumo);
      if (!insumo) throw new Error(`Insumo ${fi.idInsumo} no encontrado`);
      nutrientes.grasaTotal +=
        (insumo.grasasTotales_100g * fi.cantidadInsumo) / 100;
      nutrientes.grasaTrans +=
        (insumo.grasasTrans_100g * fi.cantidadInsumo) / 100;
      nutrientes.grasaSaturada +=
        (insumo.grasasSaturadas_100g * fi.cantidadInsumo) / 100;
      nutrientes.proteinas += (insumo.proteinas_100g * fi.cantidadInsumo) / 100;
      nutrientes.carbohidratos +=
        (insumo.carbohidratos_100g * fi.cantidadInsumo) / 100;
      nutrientes.sodio += (insumo.sodio_100g * fi.cantidadInsumo) / 100;
      nutrientes.fibra += (insumo.fibra_100g * fi.cantidadInsumo) / 100;
      nutrientes.otros += (insumo.otro_100g * fi.cantidadInsumo) / 100;
    }

    // Redondear
    (Object.keys(nutrientes) as NutrienteKey[]).forEach(
      (k) => (nutrientes[k] = round(nutrientes[k]))
    );

    // kcalorias
    let kcalorias = 0;
    for (const fi of dto.insumos) {
      const insumo = insumos.find((i) => i.id === fi.idInsumo);
      if (!insumo) throw new Error(`Insumo ${fi.idInsumo} no encontrado`);
      kcalorias += (insumo.cal_100g * fi.cantidadInsumo) / 100;
    }
    kcalorias = round(kcalorias);

    // kjuls
    let kjuls = round(kcalorias * 4.184);

    // Crear fórmula
    const formulaData = {
      nombre: dto.nombre,
      porcion,
      kcalorias,
      kjuls,
      grasaTotal: nutrientes.grasaTotal,
      grasaTrans: nutrientes.grasaTrans,
      grasaSaturada: nutrientes.grasaSaturada,
      proteinas: nutrientes.proteinas,
      carbohidratos: nutrientes.carbohidratos,
      sodio: nutrientes.sodio,
      fibra: nutrientes.fibra,
      otros: nutrientes.otros,
      esProtegida: !!dto.esProtegida,
      activo: true,
    };

    return this.repo.create(formulaData, dto.insumos);
  }

  async updateFormula(id: number, dto: any) {
    // Validación de nombre único solo entre fórmulas activas, excluyendo la actual
    const nombreExistente = await prisma.formula.findFirst({
      where: {
        nombre: { equals: dto.nombre, mode: "insensitive" },
        activo: true, // Solo valida contra fórmulas activas
        NOT: { id: id },
      },
    });
    if (nombreExistente) throw new Error("El nombre de la fórmula ya existe");

    const formula = await prisma.formula.findUnique({ where: { id } });
    if (!formula) throw new Error("Fórmula no encontrada");
    if (formula.esProtegida)
      throw new Error("No se puede modificar una fórmula protegida");

    if (!Array.isArray(dto.insumos) || dto.insumos.length === 0) {
      throw new Error("Debes agregar al menos un insumo a la fórmula");
    }

    // Calcular porción como suma de cantidades
    const porcion = dto.insumos.reduce(
      (acc: number, curr: any) => acc + Number(curr.cantidadInsumo),
      0
    );
    if (porcion <= 0)
      throw new Error("La porción calculada debe ser mayor a 0");

    let nutrientes: Record<NutrienteKey, number> = {
      grasaTotal: 0,
      grasaTrans: 0,
      grasaSaturada: 0,
      proteinas: 0,
      carbohidratos: 0,
      sodio: 0,
      fibra: 0,
      otros: 0,
    };

    const insumosIds = dto.insumos.map((i: any) => i.idInsumo);
    const insumos = await prisma.insumo.findMany({
      where: { id: { in: insumosIds }, activo: true },
    });

    for (const fi of dto.insumos) {
      const insumo = insumos.find((i) => i.id === fi.idInsumo);
      if (!insumo) throw new Error(`Insumo ${fi.idInsumo} no encontrado`);
      nutrientes.grasaTotal +=
        (insumo.grasasTotales_100g * fi.cantidadInsumo) / 100;
      nutrientes.grasaTrans +=
        (insumo.grasasTrans_100g * fi.cantidadInsumo) / 100;
      nutrientes.grasaSaturada +=
        (insumo.grasasSaturadas_100g * fi.cantidadInsumo) / 100;
      nutrientes.proteinas += (insumo.proteinas_100g * fi.cantidadInsumo) / 100;
      nutrientes.carbohidratos +=
        (insumo.carbohidratos_100g * fi.cantidadInsumo) / 100;
      nutrientes.sodio += (insumo.sodio_100g * fi.cantidadInsumo) / 100;
      nutrientes.fibra += (insumo.fibra_100g * fi.cantidadInsumo) / 100;
      nutrientes.otros += (insumo.otro_100g * fi.cantidadInsumo) / 100;
    }

    (Object.keys(nutrientes) as NutrienteKey[]).forEach(
      (k) => (nutrientes[k] = round(nutrientes[k]))
    );

    let kcalorias = 0;
    for (const fi of dto.insumos) {
      const insumo = insumos.find((i) => i.id === fi.idInsumo);
      if (!insumo) throw new Error(`Insumo ${fi.idInsumo} no encontrado`);
      kcalorias += (insumo.cal_100g * fi.cantidadInsumo) / 100;
    }
    kcalorias = round(kcalorias);

    let kjuls = round(kcalorias * 4.184);

    const formulaData = {
      nombre: dto.nombre,
      porcion,
      kcalorias,
      kjuls,
      grasaTotal: nutrientes.grasaTotal,
      grasaTrans: nutrientes.grasaTrans,
      grasaSaturada: nutrientes.grasaSaturada,
      proteinas: nutrientes.proteinas,
      carbohidratos: nutrientes.carbohidratos,
      sodio: nutrientes.sodio,
      fibra: nutrientes.fibra,
      otros: nutrientes.otros,
      esProtegida: !!dto.esProtegida,
      activo: true,
    };

    // Actualiza la fórmula y sus insumos (no crea nuevo registro)
    return this.repo.update(id, formulaData, dto.insumos);
  }

  async cloneFormula(id: number, dto: any) {
    // Obtener la fórmula original
    const original = await prisma.formula.findUnique({ where: { id } });
    if (!original) throw new Error("Fórmula original no encontrada");

    // Forzar esProtegida: false en el clon
    const clonDto = {
      ...dto,
      esProtegida: false,
      nombre: dto.nombre || original.nombre + " (copia)",
      // porcion se calcula automáticamente en createFormula
    };

    return this.createFormula(clonDto);
  }

  async softDeleteFormula(id: number) {
    // 1. Validar si existen productos asociados a esta fórmula
    const productosAsociados = await prisma.producto.count({
      where: {
        idFormula: id,
      },
    });

    if (productosAsociados > 0) {
      throw new Error(
        "No se puede eliminar la fórmula porque tiene productos asociados."
      );
    }

    // 2. Si no hay productos, proceder con la eliminación lógica
    return this.repo.softDelete(id);
  }
}
