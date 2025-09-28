import { InsumosRepository } from "../repositories/insumos.repository";

const insumosRepository = new InsumosRepository();

// Tipos derivados del propio repositorio (robustos a cambios de Prisma v6)
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
    return insumosRepository.create(data);
  }

  async update(id: number, data: UpdateData) {
    return insumosRepository.update(id, data);
  }

  async delete(id: number) {
    await insumosRepository.delete(id);
    // Si preferís devolver el registro borrado, cambia el repo para que lo retorne y aquí lo retornás.
  }
}
