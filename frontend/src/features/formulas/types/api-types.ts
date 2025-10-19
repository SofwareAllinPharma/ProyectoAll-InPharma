import type { Insumo } from '../../insumos/types/insumo.types';

export type ApiFormula = {
  id: number;
  nombre: string;
  porcion: number;
  kcalorias: number;
  kjuls: number;
  grasaTotal: number;
  grasaSaturada: number;
  grasaTrans: number;
  proteinas: number;
  carbohidratos: number;
  sodio: number;
  fibra: number;
  otros: number;
  esProtegida: boolean;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
  formulaInsumos?: {
    id: number;
    idFormula: number;
    idInsumo: number;
    cantidadInsumo: number;
    insumo?: Insumo;
  }[];
};

export type ApiInsumoReq = {
  idInsumo: number;
  cantidadInsumo: number;
};

export type ApiListEnvelope = {
  formulas: ApiFormula[];
  total?: number;
  page?: number;
  limit?: number;
};

export type ApiCreate = {
  nombre: string;
  porcion?: number;
  kcalorias: number;
  kjuls: number;
  grasaTotal: number;
  grasaSaturada: number;
  grasaTrans: number;
  proteinas: number;
  carbohidratos: number;
  sodio: number;
  fibra: number;
  otros: number;
  esProtegida: boolean;
  activo: boolean;
  insumos: ApiInsumoReq[];
};

export type ApiUpdate = Partial<Pick<ApiFormula, 'id'>> & ApiCreate;