import { api } from '../../../lib/api'
import type { Deposito, CreateDepositoDTO, UpdateDepositoDTO } from '../types/deposito.types';

const BASE = '/depositos';

export class DepositoService {
  static async getAll(): Promise<Deposito[]> {
    const { data } = await api.get<Deposito[]>(BASE);
    return data;
  }

  static async getById(id: number): Promise<Deposito> {
    const { data } = await api.get<Deposito>(`${BASE}/${id}`);
    return data;
  }

  static async create(body: CreateDepositoDTO): Promise<Deposito> {
    if (typeof body.capacidadTotal !== 'number' || body.capacidadTotal <= 0) {
      throw new Error('capacidadTotal debe ser un número positivo.');
    }
    const { data } = await api.post<Deposito>(BASE, body);
    return data;
  }

  static async update(id: number, body: UpdateDepositoDTO): Promise<Deposito> {
    if (
      body.capacidadTotal !== undefined &&
      (Number.isNaN(body.capacidadTotal) || body.capacidadTotal < 0)
    ) {
      throw new Error('capacidadTotal debe ser un número >= 0.');
    }
    const { data } = await api.put<Deposito>(`${BASE}/${id}`, body);
    return data;
  }
  
  static async deactivate(id: number): Promise<{ message: string; deposito: Deposito }> {
    const { data } = await api.delete<{ message: string; deposito: Deposito }>(`${BASE}/${id}`);
    return data;
  }
}
