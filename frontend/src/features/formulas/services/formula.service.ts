import type {
  Formula,
  CreateFormulaRequest,
  UpdateFormulaRequest,
} from '../types/formula.types';
import type { ApiFormula, ApiListEnvelope } from '../types/api-types';
import { isRecord, isNumber, isBoolean, isString } from '../../../lib/validators';
import { fromApi, toApi } from '../lib/mappers';
import { jsonOrThrow } from '../../../lib/fetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function fetchJson(url: string, opts: RequestInit = {}) {
  const defaultHeaders = { 'Content-Type': 'application/json' } as Record<string,string>;
  const headers = { ...defaultHeaders, ...(opts.headers as Record<string,string> || {}) };
  const res = await fetch(url, { ...opts, headers });
  return jsonOrThrow(res);
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

// fromApi and toApi moved to ../lib/mappers

// jsonOrThrow moved to src/lib/fetch.ts

export class FormulaService {
  static async getAllFormulas(): Promise<Formula[]> {
    const data = await fetchJson(`${API_BASE_URL}/formulas`);
    if (isApiFormulaArray(data)) return data.map(fromApi);
    if (isApiListEnvelope(data)) return data.formulas.map(fromApi);
    return [];
  }

  static async getFormulaById(id: number): Promise<Formula> {
    const data = await fetchJson(`${API_BASE_URL}/formulas/${id}`);
    if (!isApiFormula(data)) throw new Error('Respuesta inválida de la API');
    return fromApi(data);
  }

  static async createFormula(formula: CreateFormulaRequest): Promise<Formula> {
    const payload = toApi(formula);
    const data = await fetchJson(`${API_BASE_URL}/formulas`, { method: 'POST', body: JSON.stringify(payload) });
    if (!isApiFormula(data)) throw new Error('Respuesta inválida de la API');
    return fromApi(data);
  }

  static async updateFormula(
    id: number,
    formula: UpdateFormulaRequest
  ): Promise<Formula> {
    const payload = toApi({ ...formula, id });
    const data = await fetchJson(`${API_BASE_URL}/formulas/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    if (!isApiFormula(data)) throw new Error('Respuesta inválida de la API');
    return fromApi(data);
  }

  static async deleteFormula(id: number): Promise<void> {
    await fetchJson(`${API_BASE_URL}/formulas/${id}`, { method: 'DELETE' });
  }

  static async searchFormulas(searchTerm: string): Promise<Formula[]> {
    return (await this.getAllFormulas()).filter(f => f.nombre.toLowerCase().includes(searchTerm.trim().toLowerCase()));
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
