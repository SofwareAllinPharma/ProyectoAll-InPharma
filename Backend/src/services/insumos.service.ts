import { InsumosRepository } from "../repositories/insumos.repository";
import { prisma } from "../lib/prisma";

const insumosRepository = new InsumosRepository();

type CreateData = Parameters<typeof insumosRepository.create>[0];
type UpdateData = Parameters<typeof insumosRepository.update>[1];

export class InsumosService {
  async getAll() {
    return insumosRepository.findAll();
  }

  async getById(id: number) {
    return insumosRepository.findById(id);
  }

  async create(data: CreateData) {
    // VALIDACIÓN: Verificar si ya existe un insumo ACTIVO con el mismo nombre
    const insumoExistente = await prisma.insumo.findFirst({
      where: {
        nombre: { equals: data.nombre, mode: "insensitive" }, // "insensitive" ignora mayúsculas/minúsculas
        activo: true,
      },
    });

    if (insumoExistente) {
      throw new Error("Ya existe un insumo activo con este nombre.");
    }

    return insumosRepository.create(data);
  }

  async update(id: number, data: UpdateData) {
    // Opcional: También deberías validar al editar para no duplicar nombres
    if (data.nombre) {
      const insumoExistente = await prisma.insumo.findFirst({
        where: {
          nombre: { equals: data.nombre, mode: "insensitive" },
          activo: true,
          NOT: { id: id }, // Excluir el insumo actual
        },
      });

      if (insumoExistente) {
        throw new Error("Ya existe un insumo activo con este nombre.");
      }
    }

    // 1. Realizamos la actualización del insumo
    const insumoActualizado = await insumosRepository.update(id, data);

    // 2. Buscamos todas las fórmulas que utilizan este insumo
    const formulasAfectadas = await prisma.formulaInsumo.findMany({
      where: { idInsumo: id },
      select: { idFormula: true },
      distinct: ["idFormula"],
    });

    // 3. Recalculamos los valores nutricionales de cada fórmula afectada
    for (const f of formulasAfectadas) {
      await this.recalcularValoresFormula(f.idFormula);
    }

    return insumoActualizado;
  }

  async delete(id: number) {
    const insumoEnUso = await prisma.formulaInsumo.findFirst({
      where: {
        idInsumo: id,
        formula: { activo: true },
      },
    });

    if (insumoEnUso) {
      throw new Error(
        "No se puede eliminar el insumo porque está vinculado a una o más fórmulas activas."
      );
    }

    await insumosRepository.delete(id);
  }

  // --- MÉTODO PRIVADO PARA RECALCULAR FÓRMULAS ---
  private async recalcularValoresFormula(idFormula: number) {
    const formula = await prisma.formula.findUnique({
      where: { id: idFormula },
      include: {
        formulaInsumos: {
          include: {
            insumo: true,
          },
        },
      },
    });

    if (!formula || !formula.formulaInsumos.length) return;

    let totalPesoBatch = 0;
    let totalKcal = 0;
    let totalGrasas = 0;
    let totalTrans = 0;
    let totalSat = 0;
    let totalProt = 0;
    let totalCarb = 0;
    let totalSodio = 0;
    let totalFibra = 0;
    let totalOtros = 0;

    for (const item of formula.formulaInsumos) {
      const qty = item.cantidadInsumo;
      const insumo = item.insumo;

      if (!insumo) continue;

      totalPesoBatch += qty;

      // Factor: (cantidad en formula / 100g)
      const factor = qty / 100;

      totalKcal += factor * (insumo.cal_100g || 0);
      totalGrasas += factor * (insumo.grasasTotales_100g || 0);
      totalTrans += factor * (insumo.grasasTrans_100g || 0);
      totalSat += factor * (insumo.grasasSaturadas_100g || 0);
      totalProt += factor * (insumo.proteinas_100g || 0);
      totalCarb += factor * (insumo.carbohidratos_100g || 0);
      totalSodio += factor * (insumo.sodio_100g || 0);
      totalFibra += factor * (insumo.fibra_100g || 0);
      totalOtros += factor * (insumo.otro_100g || 0);
    }

    const porcion = formula.porcion || 0;

    if (totalPesoBatch === 0 || porcion === 0) return;

    const ratio = porcion / totalPesoBatch;

    await prisma.formula.update({
      where: { id: idFormula },
      data: {
        kcalorias: totalKcal * ratio,
        kjuls: totalKcal * ratio * 4.184,
        grasaTotal: totalGrasas * ratio,
        grasaTrans: totalTrans * ratio,
        grasaSaturada: totalSat * ratio,
        proteinas: totalProt * ratio,
        carbohidratos: totalCarb * ratio,
        sodio: totalSodio * ratio,
        fibra: totalFibra * ratio,
        otros: totalOtros * ratio,
      },
    });
  }
}
