import { api } from '../../../lib/api';
import type { UsuarioResumen } from '../types/schedule';

export class UsuarioService {
  static async getAll(): Promise<UsuarioResumen[]> {
    const { data } = await api.get<UsuarioResumen[]>('/usuarios');
    return data;
  }
}
