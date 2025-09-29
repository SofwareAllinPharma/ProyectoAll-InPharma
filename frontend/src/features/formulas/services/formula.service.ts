import type {
  Formula,
  CreateFormulaRequest,
  UpdateFormulaRequest,
} from '../types/formula.types';
import type { Insumo } from '../../insumos/types/insumo.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/** ---- Tipos que refleja tu API (schema.prisma) ---- */
type ApiFormula = {
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
  // Los insumos vienen como formulaInsumos del backend
  formulaInsumos?: {
    id: number;
    idFormula: number;
    idInsumo: number;
    cantidadInsumo: number;
    insumo?: Insumo;
  }[];
};

type ApiInsumoReq = {
  idInsumo: number;
  cantidadInsumo: number;
};

type ApiListEnvelope = {
  formulas: ApiFormula[];
  total?: number;
  page?: number;
  limit?: number;
};

/** Al crear/actualizar enviamos además los insumos (Solución A los exige) */
type ApiCreate = {
  nombre: string;
  // La porción se recalcula en backend con las cantidades, por eso la dejamos opcional
  porcion?: number;

  // Campos recalculados por backend (los mandamos en 0)
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

  // 👇 clave para que el backend no explote con `.map`
  insumos: ApiInsumoReq[];
};

type ApiUpdate = Partial<Pick<ApiFormula, 'id'>> & ApiCreate;

/* ---------- Type guards ---------- */
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function isNumber(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

function isBoolean(x: unknown): x is boolean {
  return typeof x === 'boolean';
}

function isString(x: unknown): x is string {
  return typeof x === 'string';
}

function isApiFormula(x: unknown): x is ApiFormula {
  if (!isRecord(x)) return false;
  const hasRequiredFields = (
    isNumber(x.id) &&
    isString(x.nombre) &&
    isNumber(x.porcion) &&
    isNumber(x.kcalorias) &&
    isNumber(x.kjuls) &&
    isNumber(x.grasaTotal) &&
    isNumber(x.grasaSaturada) &&
    isNumber(x.grasaTrans) &&
    isNumber(x.proteinas) &&
    isNumber(x.carbohidratos) &&
    isNumber(x.sodio) &&
    isNumber(x.fibra) &&
    isNumber(x.otros) &&
    isBoolean(x.esProtegida) &&
    isBoolean(x.activo)
  );
  
  // formulaInsumos es opcional, si existe debe ser un array
  if (x.formulaInsumos !== undefined && !Array.isArray(x.formulaInsumos)) {
    return false;
  }
  
  return hasRequiredFields;
}

function isApiFormulaArray(x: unknown): x is ApiFormula[] {
  return Array.isArray(x) && x.every(isApiFormula);
}

function isApiListEnvelope(x: unknown): x is ApiListEnvelope {
  if (!isRecord(x)) return false;
  const maybe = x as Record<string, unknown>;
  return Array.isArray(maybe.formulas) && isApiFormulaArray(maybe.formulas);
}

/* ---------- Mapeos UI <-> API ---------- */
function fromApi(a: ApiFormula): Formula {
  // Mapear los insumos desde formulaInsumos del backend
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
    porcionMinima: a.porcion,
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

function toApi(u: CreateFormulaRequest | UpdateFormulaRequest): ApiUpdate {
  // ⚠️ Aseguramos que los insumos se envíen al backend
  const requestWithInsumos = u as CreateFormulaRequest | UpdateFormulaRequest;
  const insumos: ApiInsumoReq[] = Array.isArray(requestWithInsumos.insumos)
    ? requestWithInsumos.insumos.map((i) => ({
        idInsumo: Number(i.idInsumo),
        cantidadInsumo: Number(i.cantidadInsumo),
      }))
    : [];

  const base: ApiCreate = {
    nombre: u.nombre,
    // La porción la calcula el backend a partir de insumos:
    porcion: undefined,

    // Se recalculan en backend (mandamos 0)
    kcalorias: 0,
    kjuls: 0,
    carbohidratos: 0,
    proteinas: 0,
    grasaTotal: 0,
    grasaSaturada: 0,
    grasaTrans: 0,
    fibra: 0,
    sodio: 0,
    otros: 0,

    esProtegida: u.esProtegida,
    activo: true,

    insumos,
  };

  if ('id' in u) {
    const up = u as UpdateFormulaRequest;
    return { id: up.id, ...base };
  }
  return base;
}

/* ---------- Helper fetch robusto ---------- */
async function jsonOrThrow(res: Response): Promise<unknown> {
  const text = await res.text();
  let data: unknown = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    // no-op: si no es JSON, nos quedamos con text
  }

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    
    if (data && typeof data === 'object' && data !== null) {
      const errorObj = data as Record<string, unknown>;
      if (typeof errorObj.error === 'string') {
        message = errorObj.error;
      } else if (typeof errorObj.message === 'string') {
        message = errorObj.message;
      }
    } else if (typeof data === 'string') {
      message = data;
    }
    
    throw new Error(message);
  }
  return data;
}

/* ---------- Service ---------- */
export class FormulaService {
  static async getAllFormulas(): Promise<Formula[]> {
    const res = await fetch(`${API_BASE_URL}/formulas`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await jsonOrThrow(res);

    if (isApiFormulaArray(data)) return data.map(fromApi);
    if (isApiListEnvelope(data)) return data.formulas.map(fromApi);
    return [];
  }

  static async getFormulaById(id: number): Promise<Formula> {
    const res = await fetch(`${API_BASE_URL}/formulas/${id}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await jsonOrThrow(res);
    if (!isApiFormula(data)) throw new Error('Respuesta inválida de la API');
    return fromApi(data);
  }

  static async createFormula(formula: CreateFormulaRequest): Promise<Formula> {
    const payload = toApi(formula);
    const res = await fetch(`${API_BASE_URL}/formulas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await jsonOrThrow(res);
    
    // Debug: log de la respuesta para investigar problemas
    console.log('Respuesta del servidor para createFormula:', data);
    
    if (!isApiFormula(data)) {
      console.error('Estructura de datos no válida:', data);
      console.error('Campos esperados:', {
        id: 'number',
        nombre: 'string',
        porcion: 'number',
        kcalorias: 'number',
        kjuls: 'number',
        grasaTotal: 'number',
        grasaSaturada: 'number',
        grasaTrans: 'number',
        proteinas: 'number',
        carbohidratos: 'number',
        sodio: 'number',
        fibra: 'number',
        otros: 'number',
        esProtegida: 'boolean',
        activo: 'boolean'
      });
      throw new Error('Respuesta inválida de la API');
    }
    return fromApi(data);
  }

  static async updateFormula(
    id: number,
    formula: UpdateFormulaRequest
  ): Promise<Formula> {
    const payload = toApi({ ...formula, id });
    const res = await fetch(`${API_BASE_URL}/formulas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await jsonOrThrow(res);
    if (!isApiFormula(data)) throw new Error('Respuesta inválida de la API');
    return fromApi(data);
  }

  static async deleteFormula(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/formulas/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) await jsonOrThrow(res); // lanzará con mensaje claro
  }

  static async searchFormulas(searchTerm: string): Promise<Formula[]> {
    const all = await this.getAllFormulas();
    const q = searchTerm.trim().toLowerCase();
    return all.filter((f) => f.nombre.toLowerCase().includes(q));
  }

  static async checkFormulaProtection(
    id: number
  ): Promise<{ canEdit: boolean; reason?: string }> {
    const f = await this.getFormulaById(id);
    if (f.esProtegida)
      return { canEdit: false, reason: 'La fórmula está marcada como protegida' };
    return { canEdit: true };
  }
}
