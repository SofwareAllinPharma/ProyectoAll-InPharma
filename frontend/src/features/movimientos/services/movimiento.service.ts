import axios from 'axios';
import type { 
  Movimiento, 
  CreateMovimientoRequest, 
  UpdateEstadoMovimientoRequest,
  MovimientoFilters,
  MovimientosResumen
} from '../types/movimiento.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class MovimientoService {
  private static getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async getAllMovimientos(filters?: MovimientoFilters): Promise<Movimiento[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.tipo) params.append('tipo', filters.tipo);
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.idDeposito) params.append('idDeposito', String(filters.idDeposito));
      if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
      if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/movimientos${queryString ? `?${queryString}` : ''}`;

      const response = await axios.get<Movimiento[]>(url, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
      throw error;
    }
  }

  static async getMovimientosByDeposito(idDeposito: number): Promise<Movimiento[]> {
    try {
      const response = await axios.get<Movimiento[]>(
        `${API_BASE_URL}/movimientos/deposito/${idDeposito}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo movimientos del depósito:', error);
      throw error;
    }
  }

  static async getMovimientoById(id: number): Promise<Movimiento> {
    try {
      const response = await axios.get<Movimiento>(
        `${API_BASE_URL}/movimientos/${id}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo movimiento:', error);
      throw error;
    }
  }

  static async createMovimiento(data: CreateMovimientoRequest): Promise<Movimiento> {
    try {
      const response = await axios.post<Movimiento>(
        `${API_BASE_URL}/movimientos`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creando movimiento:', error);
      throw error;
    }
  }

  static async updateEstadoMovimiento(
    id: number, 
    data: UpdateEstadoMovimientoRequest
  ): Promise<Movimiento> {
    try {
      const response = await axios.patch<Movimiento>(
        `${API_BASE_URL}/movimientos/${id}/estado`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    }
  }

  static async getResumenMovimientos(idDeposito?: number): Promise<MovimientosResumen> {
    try {
      const url = idDeposito 
        ? `${API_BASE_URL}/movimientos/resumen?idDeposito=${idDeposito}`
        : `${API_BASE_URL}/movimientos/resumen`;

      const response = await axios.get<MovimientosResumen>(url, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo resumen:', error);
      throw error;
    }
  }

  static async validarStock(
    idDeposito: number,
    idProducto: number,
    cantidad: number
  ): Promise<{ valido: boolean; mensaje?: string }> {
    try {
      const response = await axios.post<{ valido: boolean; mensaje?: string }>(
        `${API_BASE_URL}/movimientos/validar-stock`,
        { idDeposito, idProducto, cantidad },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error validando stock:', error);
      return { 
        valido: false, 
        mensaje: 'Error al validar stock' 
      };
    }
  }
}