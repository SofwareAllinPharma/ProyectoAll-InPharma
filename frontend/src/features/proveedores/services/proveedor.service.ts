import { api } from '../../../lib/api';
import type { Proveedor, CreateProveedorDto, UpdateProveedorDto } from '../types/proveedor.types';

export class ProveedorService {
  static async list(): Promise<Proveedor[]> {
    const { data } = await api.get('/proveedores');
    return data;
  }

  static async create(dto: CreateProveedorDto): Promise<Proveedor> {
    const { data } = await api.post('/proveedores', dto);
    return data;
  }

  static async update(id: number, dto: UpdateProveedorDto): Promise<Proveedor> {
    const { data } = await api.put(`/proveedores/${id}`, dto);
    return data;
  }

  static async remove(id: number): Promise<void> {
    await api.delete(`/proveedores/${id}`);
  }
}
