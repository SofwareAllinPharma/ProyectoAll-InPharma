import type {
  Producto,
  CreateProductoRequest,
  UpdateProductoRequest,
  ProductoSearchFilters,
} from '../types/producto.types';
import { fromApi as mapFormulaFromApi } from '../../formulas/lib/mappers';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ProductoService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      let errorMessage = errorData?.error || errorData?.message || `Error ${response.status}: ${response.statusText}`;
      
      // Mejorar mensajes de error específicos
      if (errorMessage.includes('Unique constraint failed') && errorMessage.includes('nombreComercial')) {
        errorMessage = 'Ya existe un producto con este nombre comercial. Por favor, elige un nombre diferente.';
      } else if (errorMessage.includes('Unique constraint failed')) {
        errorMessage = 'Ya existe un registro con estos datos. Por favor, verifica la información.';
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async getAllProductos(filters?: ProductoSearchFilters): Promise<Producto[]> {
    const params = new URLSearchParams();
    
    if (filters?.search && filters.search.trim()) {
      if (filters.buscarPor === 'producto') {
        params.append('search', filters.search);
      } else if (filters.buscarPor === 'formula') {
        params.append('formula', filters.search);
      } else if (filters.buscarPor === 'insumo') {
        params.append('insumo', filters.search);
      }
    }

    const queryString = params.toString();
    const endpoint = `/productos${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<Producto[]>(endpoint);
    // map nested formula objects from API shape to frontend Formula type
    if (Array.isArray(response)) {
      return response.map((p) => ({
        ...p,
        formula: p.formula ? mapFormulaFromApi(p.formula as any) : undefined,
      }));
    }
    return response || [];
  }

  static async getProductoById(id: number): Promise<Producto> {
    const res = await this.request<Producto>(`/productos/${id}`);
    return { ...res, formula: res.formula ? mapFormulaFromApi(res.formula as any) : undefined } as Producto;
  }

  static async createProducto(data: CreateProductoRequest): Promise<Producto> {
    return this.request<Producto>('/productos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateProducto(id: number, data: UpdateProductoRequest): Promise<Producto> {
    return this.request<Producto>(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteProducto(id: number): Promise<void> {
    await this.request<void>(`/productos/${id}`, {
      method: 'DELETE',
    });
  }

  static async getProductosByFormula(formulaId: number): Promise<Producto[]> {
    const response = await this.request<Producto[]>(`/productos/formula/${formulaId}`);
    return response || [];
  }

  // Utilidad para calcular peso neto basado en porciones
  static calculatePesoNetoFromPorciones(porciones: number, pesoPorPorcion: number): number {
    return porciones * pesoPorPorcion;
  }

  // Utilidad para calcular porciones basado en peso neto
  static calculatePorcionesFromPesoNeto(pesoNeto: number, pesoPorPorcion: number): {
    porcionesCompletas: number;
    pesoPorcionParcial: number;
    cantPorcionesAportadas: number;
  } {
    const cantPorcionesAportadas = pesoNeto / pesoPorPorcion;
    const porcionesCompletas = Math.floor(cantPorcionesAportadas);
    const pesoPorcionParcial = (cantPorcionesAportadas - porcionesCompletas) * pesoPorPorcion;
    
    return {
      porcionesCompletas,
      pesoPorcionParcial,
      cantPorcionesAportadas,
    };
  }
}