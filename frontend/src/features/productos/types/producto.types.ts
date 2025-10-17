import type { Formula } from '../../formulas/types/formula.types';

export interface Producto {
  idProducto: number;
  idFormula: number;
  nombreComercial: string;
  pesoNeto: number;
  cantPorcionesAportadas: number;
  estaActivo: boolean;
  createdAt?: string;
  updatedAt?: string;
  formula?: Formula;
}

export interface CreateProductoRequest {
  idFormula: number;
  nombreComercial: string;
  pesoNeto?: number;
  cantPorcionesAportadas?: number;
  calculationMode: 'pesoNeto' | 'porciones'; // Para indicar cómo se está calculando
}

export interface UpdateProductoRequest extends CreateProductoRequest {
  idProducto: number;
}

export interface ProductoModalAction {
  type: 'view' | 'edit' | 'delete' | 'cancel';
  producto?: Producto;
}

export interface ProductCalculation {
  pesoNeto: number;
  cantPorcionesAportadas: number;
  porcionesCompletas: number;
  pesoPorcionParcial: number;
}

// Tipos para búsqueda avanzada
export interface ProductoSearchFilters {
  search: string;
  buscarPor: 'producto' | 'formula' | 'insumo';
  estado: 'activo' | 'inactivo' | 'todos';
}