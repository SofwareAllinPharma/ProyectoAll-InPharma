// frontend/src/types/formula.types.ts

// Importar tipos de insumos
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
  porcionMinima: number;
  kcaloriasPorPorcion: number;
  kjPorPorcion: number;
  carbohidratosPorPorcion: number;
  proteinasPorPorcion: number;
  grasaTotalPorPorcion: number;
  grasaSaturadaPorPorcion: number;
  grasaTransPorPorcion: number;
  fibraPorPorcion: number;
  sodioPorPorcion: number;
  esProtegida: boolean;
  createdAt?: string;
  updatedAt?: string;
  insumos?: FormulaInsumo[];
}

// 👇 Tipo reutilizable para requests de insumos
export interface FormulaInsumoRequest {
  idInsumo: number;
  cantidadInsumo: number;
}

export interface CreateFormulaRequest {
  nombre: string;
  porcionMinima?: number; // opcional, backend la recalcula
  esProtegida: boolean;
  insumos: FormulaInsumoRequest[]; // requerido según Solución A
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
}