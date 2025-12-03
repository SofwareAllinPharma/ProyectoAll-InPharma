import { api } from '../../../lib/api';
import type {
  Producto,
  CreateProductoRequest,
  UpdateProductoRequest,
  ProductoSearchFilters,
} from '../types/producto.types';
import { fromApi as mapFormulaFromApi } from '../../formulas/lib/mappers';

export class ProductoService {
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
    
    const { data } = await api.get<Producto[]>(endpoint);
    // map nested formula objects from API shape to frontend Formula type
    if (Array.isArray(data)) {
      return data.map((p) => ({
        ...p,
        formula: p.formula ? mapFormulaFromApi(p.formula as any) : undefined,
      }));
    }
    return data || [];
  }

  static async getProductoById(id: number): Promise<Producto> {
    const { data } = await api.get<Producto>(`/productos/${id}`);
    return { ...data, formula: data.formula ? mapFormulaFromApi(data.formula as any) : undefined } as Producto;
  }

  static async createProducto(data: CreateProductoRequest): Promise<Producto> {
    const { data: responseData } = await api.post<Producto>('/productos', data);
    return responseData;
  }

  static async updateProducto(id: number, data: UpdateProductoRequest): Promise<Producto> {
    const { data: responseData } = await api.put<Producto>(`/productos/${id}`, data);
    return responseData;
  }

  static async deleteProducto(id: number): Promise<void> {
    await api.delete(`/productos/${id}`);
  }

  static async getProductosByFormula(formulaId: number): Promise<Producto[]> {
    const { data } = await api.get<Producto[]>(`/productos/formula/${formulaId}`);
    return data || [];
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