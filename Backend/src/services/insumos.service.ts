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

    return insumosRepository.update(id, data);
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
}
