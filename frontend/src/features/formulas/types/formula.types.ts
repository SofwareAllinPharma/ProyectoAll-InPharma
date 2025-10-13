import type { Insumo } from '../../insumos/types/insumo.types';

export interface FormulaInsumo {
  id?: number;
  idFormula: number;
  idInsumo: number;
  cantidadInsumo: number;
  insumo?: Insumo;
}

export interface Formula {
  id: number;
  nombre: string;
  porcion?: number; // Campo del backend
  porcionMinima?: number; // Campo del frontend legacy - mantener para compatibilidad
  // Campos del backend
  kcalorias?: number;
  kjuls?: number;
  grasaTotal?: number;
  grasaTrans?: number;
  grasaSaturada?: number;
  proteinas?: number;
  carbohidratos?: number;
  sodio?: number;
  fibra?: number;
  otros?: number;
  // Campos legacy del frontend - mantener para compatibilidad
  kcaloriasPorPorcion?: number;
  kjPorPorcion?: number;
  carbohidratosPorPorcion?: number;
  proteinasPorPorcion?: number;
  grasaTotalPorPorcion?: number;
  grasaSaturadaPorPorcion?: number;
  grasaTransPorPorcion?: number;
  fibraPorPorcion?: number;
  sodioPorPorcion?: number;
  otrosPorPorcion?: number;
  esProtegida: boolean;
  createdAt?: string;
  updatedAt?: string;
  insumos?: FormulaInsumo[];
}

export interface FormulaInsumoRequest {
  idInsumo: number;
  cantidadInsumo: number;
}

export interface CreateFormulaRequest {
  nombre: string;
  porcionMinima?: number;
  esProtegida: boolean;
  insumos: FormulaInsumoRequest[];
}

export interface UpdateFormulaRequest extends CreateFormulaRequest {
  id: number;
}

export interface NutritionCalculation {
  kcaloriasPorPorcion: number;
  kjPorPorcion: number;
  carbohidratosPorPorcion: number;
  proteinasPorPorcion: number;
  grasaTotalPorPorcion: number;
  grasaSaturadaPorPorcion: number;
  grasaTransPorPorcion: number;
  fibraPorPorcion: number;
  sodioPorPorcion: number;
  otrosPorPorcion: number;
}