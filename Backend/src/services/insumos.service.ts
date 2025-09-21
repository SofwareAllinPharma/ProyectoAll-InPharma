import { InsumosRepository } from "../repositories/insumos.repository";
import { Insumos } from "@prisma/client";

const insumosRepository = new InsumosRepository();

export class InsumosService {
  async getAll(): Promise<Insumos[]> {
    return insumosRepository.findAll();
  }

  async getById(id: number): Promise<Insumos | null> {
    return insumosRepository.findById(id);
  }

  async create(data: Omit<Insumos, "id">): Promise<Insumos> {
    return insumosRepository.create(data);
  }

  async update(
    id: number,
    data: Partial<Omit<Insumos, "id">>
  ): Promise<Insumos> {
    return insumosRepository.update(id, data);
  }

  async delete(id: number): Promise<Insumos> {
    return insumosRepository.delete(id);
  }
}
