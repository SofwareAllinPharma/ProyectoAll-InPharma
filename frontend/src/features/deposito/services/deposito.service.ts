import type { Deposito, CreateDepositoDTO, UpdateDepositoDTO, CanDeleteResponse } from '../types/deposito.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const BASE = `${API_BASE_URL}/depositos`;

async function handle<T>(res: Response, msg: string): Promise<T> {
  if (!res.ok) throw new Error(`${msg}: ${res.status} ${res.statusText}`);
  const ct = res.headers.get('content-type') || '';
  try {
    if (!ct.includes('application/json')) {
      const text = await res.text();
      throw new Error(`${msg}: respuesta no JSON -> "${text.slice(0,80)}"`);
    }
    return (await res.json()) as T;
  } catch (e: any) {
    throw new Error(e?.message || msg);
  }
}

export class DepositoService {
  static async getAll(): Promise<Deposito[]> {
    const r = await fetch(BASE, { headers: { 'Content-Type': 'application/json' } });
    return handle<Deposito[]>(r, 'Error al obtener depósitos');
  }
  static async getById(id: number): Promise<Deposito> {
    const r = await fetch(`${BASE}/${id}`, { headers: { 'Content-Type': 'application/json' } });
    return handle<Deposito>(r, 'Error al obtener depósito');
  }
  static async create(body: CreateDepositoDTO): Promise<Deposito> {
    const r = await fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return handle<Deposito>(r, 'Error al crear depósito');
  }
  static async update(id: number, body: UpdateDepositoDTO): Promise<Deposito> {
    const r = await fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return handle<Deposito>(r, 'Error al actualizar depósito');
  }
  static async remove(id: number): Promise<void> {
    const r = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error(`Error al eliminar depósito: ${r.statusText}`);
  }
  static async canDelete(id: number): Promise<CanDeleteResponse> {
    const r = await fetch(`${BASE}/${id}/can-delete`, { headers: { 'Content-Type': 'application/json' } });
    return handle<CanDeleteResponse>(r, 'Error al validar eliminación');
  }
}
