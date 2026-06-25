import { api } from '../../../lib/api';
import type {
  Formula,
  CreateFormulaRequest,
  UpdateFormulaRequest,
} from '../types/formula.types';
import { fromApi, toApi } from '../lib/mappers';

export class FormulaService {
  static async getAllFormulas(insumoId?: number): Promise<Formula[]> {
    const params = new URLSearchParams();
    if (insumoId) params.append('insumoId', insumoId.toString());

    const { data } = await api.get(`/formulas?${params.toString()}`);

    if (data.formulas && Array.isArray(data.formulas)) {
      return data.formulas.map(fromApi);
    }
    if (Array.isArray(data)) {
      return data.map(fromApi);
    }
    return [];
  }

  static async getFormulaById(id: number): Promise<Formula> {
    const { data } = await api.get(`/formulas/${id}`);
    return fromApi(data);
  }

  static async createFormula(formula: CreateFormulaRequest): Promise<Formula> {
    const payload = toApi(formula);
    const { data } = await api.post('/formulas', payload);
    return fromApi(data);
  }

  static async updateFormula(
    id: number,
    formula: UpdateFormulaRequest
  ): Promise<Formula> {
    const payload = toApi({ ...formula, id });
    const { data } = await api.put(`/formulas/${id}`, payload);
    return fromApi(data);
  }

  static async deleteFormula(id: number): Promise<void> {
    await api.delete(`/formulas/${id}`);
  }

  static async searchFormulas(searchTerm: string): Promise<Formula[]> {
    return (await this.getAllFormulas()).filter(f => f.nombre.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  }

  static async getCosto(idFormula: number): Promise<{
    costoPorPorcion: number;
    esParcial: boolean;
    insumosSinPrecio: string[];
    detalle: { insumo: string; gramos: number; precioPorKg: number | null; costoAporte: number | null }[];
  }> {
    const { data } = await api.get(`/formulas/${idFormula}/costo`);
    return data;
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