import { api } from '../../../lib/api';
import type { Insumo, CreateInsumoDto, UpdateInsumoDto, PrecioInsumo } from '../types/insumo.types';

export class InsumoService {
  static async getAllInsumos(): Promise<Insumo[]> {
    try {
      const { data } = await api.get('/insumos');
      return data;
    } catch (error) {
      console.error('Error en getAllInsumos:', error);
      throw error;
    }
  }

  static async getInsumoById(id: number): Promise<Insumo> {
    try {
      const { data } = await api.get(`/insumos/${id}`);
      return data;
    } catch (error) {
      console.error('Error en getInsumoById:', error);
      throw error;
    }
  }

  static async createInsumo(insumo: CreateInsumoDto): Promise<Insumo> {
    try {
      const { data } = await api.post('/insumos', insumo);
      return data;
    } catch (error) {
      console.error('Error en createInsumo:', error);
      throw error;
    }
  }

  static async updateInsumo(id: number, insumo: UpdateInsumoDto): Promise<Insumo> {
    try {
      const { data } = await api.put(`/insumos/${id}`, insumo);
      return data;
    } catch (error) {
      console.error('Error en updateInsumo:', error);
      throw error;
    }
  }

  static async deleteInsumo(id: number): Promise<void> {
    try {
      await api.delete(`/insumos/${id}`);
    } catch (error) {
      console.error('Error en deleteInsumo:', error);
      throw error;
    }
  }

  static async getPrecios(id: number): Promise<PrecioInsumo[]> {
    const { data } = await api.get(`/insumos/${id}/precios`);
    return data;
  }

  static async setNuevoPrecio(id: number, dto: { idProveedor: number; precioPorKg: number; observacion?: string }): Promise<PrecioInsumo> {
    const { data } = await api.post(`/insumos/${id}/precios`, dto);
    return data;
  }

  static async deletePrecio(id: number, precioId: number): Promise<void> {
    await api.delete(`/insumos/${id}/precios/${precioId}`);
  }

  static async searchInsumos(searchTerm: string): Promise<Insumo[]> {
    try {
      const allInsumos = await this.getAllInsumos();
      return allInsumos.filter(insumo => 
        insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error en searchInsumos:', error);
      throw error;
    }
  }
}
