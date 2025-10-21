import type { ApiFormula, ApiInsumoReq, ApiCreate, ApiUpdate } from '../types/api-types';
import type { Formula, CreateFormulaRequest, UpdateFormulaRequest } from '../types/formula.types';

export function fromApi(a: ApiFormula): Formula {
  const insumos = a.formulaInsumos?.map(fi => ({
    id: fi.id,
    idFormula: fi.idFormula,
    idInsumo: fi.idInsumo,
    cantidadInsumo: fi.cantidadInsumo,
    insumo: fi.insumo
  })) || [];

  return {
    id: a.id,
    nombre: a.nombre,
    porcion: a.porcion,
    kcaloriasPorPorcion: a.kcalorias,
    kjPorPorcion: a.kjuls,
    carbohidratosPorPorcion: a.carbohidratos,
    proteinasPorPorcion: a.proteinas,
    grasaTotalPorPorcion: a.grasaTotal,
    grasaSaturadaPorPorcion: a.grasaSaturada,
    grasaTransPorPorcion: a.grasaTrans,
    fibraPorPorcion: a.fibra,
    sodioPorPorcion: a.sodio,
    esProtegida: a.esProtegida,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    insumos: insumos,
  };
}

export function toApi(u: CreateFormulaRequest | UpdateFormulaRequest): ApiUpdate {
  const requestWithInsumos = u as CreateFormulaRequest | UpdateFormulaRequest;
  const insumos: ApiInsumoReq[] = Array.isArray(requestWithInsumos.insumos)
    ? requestWithInsumos.insumos.map((i) => ({ idInsumo: Number(i.idInsumo), cantidadInsumo: Number(i.cantidadInsumo) }))
    : [];

  const base: ApiCreate = {
    nombre: u.nombre,
    porcion: undefined,
    kcalorias: 0, kjuls: 0, carbohidratos: 0, proteinas: 0,
    grasaTotal: 0, grasaSaturada: 0, grasaTrans: 0, fibra: 0, sodio: 0, otros: 0,
    esProtegida: u.esProtegida,
    activo: true,
    insumos,
  };

  if ('id' in u) { const up = u as UpdateFormulaRequest; return { id: up.id, ...base }; }
  return base;
}