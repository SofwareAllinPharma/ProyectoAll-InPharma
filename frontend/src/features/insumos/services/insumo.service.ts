import type { Insumo, CreateInsumoDto, UpdateInsumoDto } from '../types/insumo.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class InsumoService {
  /**
   * Obtiene todos los insumos
   */
  static async getAllInsumos(): Promise<Insumo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/insumos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener insumos: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getAllInsumos:', error);
      throw error;
    }
  }

  /**
   * Obtiene un insumo por ID
   */
  static async getInsumoById(id: number): Promise<Insumo> {
    try {
      const response = await fetch(`${API_BASE_URL}/insumos/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener insumo: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getInsumoById:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo insumo
   */
  static async createInsumo(insumo: CreateInsumoDto): Promise<Insumo> {
    try {
      const response = await fetch(`${API_BASE_URL}/insumos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(insumo),
      });

      if (!response.ok) {
        throw new Error(`Error al crear insumo: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createInsumo:', error);
      throw error;
    }
  }

  /**
   * Actualiza un insumo existente
   */
  static async updateInsumo(id: number, insumo: UpdateInsumoDto): Promise<Insumo> {
    try {
      const response = await fetch(`${API_BASE_URL}/insumos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(insumo),
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar insumo: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateInsumo:', error);
      throw error;
    }
  }

  /**
   * Elimina un insumo
   */
  static async deleteInsumo(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/insumos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar insumo: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en deleteInsumo:', error);
      throw error;
    }
  }

  /**
   * Busca insumos por nombre
   */
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