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

      const response = await axios.get(url, {
        headers: this.getHeaders(),
      });

      // Normalizar distintos formatos que el backend puede devolver:
      // - lista directa: []
      // - paginado: { data: [], meta: { ... } }
      const respData = response.data;
      const rawList = Array.isArray(respData) ? respData : (respData && Array.isArray(respData.data) ? respData.data : null);
      if (!rawList) {
        console.warn('Formato inesperado en getAllMovimientos, devolviendo array vacío:', respData);
        return [];
      }

      // Funciones utilitarias para normalizar
      const normalizeEstado = (s?: string | null) => {
        if (!s) return 'EN_CAMINO';
        const norm = s.toString().toLowerCase().replace(/\s+/g, '');
        if (norm.includes('encamino') || norm.includes('encam')) return 'EN_CAMINO';
        if (norm.includes('entregado')) return 'ENTREGADO';
        if (norm.includes('cancelado')) return 'CANCELADO';
        return 'EN_CAMINO';
      };

      const normalizeTipo = (t?: string | null, item?: any) => {
        if (t) {
          const low = t.toString().toLowerCase();
          if (low.includes('tras')) return 'TRASLADO';
          if (low.includes('egre')) return 'EGRESO';
          if (low.includes('ingr')) return 'INGRESO';
        }
        // intentar inferir: si existe depositoDestino -> traslado, si no -> egreso
        if (item?.depositoDestino) return 'TRASLADO';
        return 'EGRESO';
      };

      // Mapear cada elemento al tipo Movimiento esperado por el frontend
      const mapped: Movimiento[] = (rawList as any[]).map((it) => {
        const id = it.idMovimiento ?? it.id ?? 0;
        const productoNombre = typeof it.producto === 'string' ? it.producto : (it.producto?.nombreComercial ?? it.producto?.nombre ?? undefined);
        const depositoOrigenNombre = it.depositoOrigen ?? (it.depositoOrigen?.nombre ?? undefined) ?? null;
        const depositoDestinoNombre = it.depositoDestino ?? (it.depositoDestino?.nombre ?? undefined) ?? null;

        const estadoNorm = normalizeEstado(it.estado);
        const tipoNorm = normalizeTipo(it.tipo ?? it.nombreTipoMovimiento ?? undefined, it);

        const movimiento: Movimiento = {
          id: id,
          tipo: tipoNorm as any,
          idProducto: it.idProducto ?? 0,
          cantidad: it.cantidad ?? 0,
          idDepositoOrigen: it.idDepositoOrigen ?? 0,
          idDepositoDestino: it.idDepositoDestino ?? null,
          referencia: it.referencia ?? '',
          observaciones: it.observaciones ?? null,
          estado: estadoNorm as any,
          fechaCreacion: it.fechaCreacion ?? '',
          fechaActualizacion: it.fechaHoraActualizacion ?? null,
          idUsuario: it.idUsuario ?? 0,
          producto: {
            idProducto: it.idProducto ?? 0,
            nombreComercial: productoNombre ?? 'N/A'
          },
          depositoOrigen: { id: it.idDepositoOrigen ?? 0, nombre: depositoOrigenNombre ?? 'N/A' },
          depositoDestino: depositoDestinoNombre ? { id: it.idDepositoDestino ?? 0, nombre: depositoDestinoNombre } : null,
          usuario: it.usuario ? { id: it.usuario.id ?? 0, nombre: it.usuario.nombre ?? 'N/A' } : undefined
        };

        return movimiento;
      });

      return mapped;
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
      throw error;
    }
  }

  static async getMovimientosByDeposito(idDeposito: number): Promise<Movimiento[]> {
    try {
      // Preferir el endpoint genérico que ya normaliza la respuesta
      return await this.getAllMovimientos({ idDeposito } as any);
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
      // Backend expects PUT /movimientos and payload with either idTipoMovimiento or nombreTipoMovimiento
      // Map frontend 'tipo' (EGRESO|TRASLADO|INGRESO) to the seed names (Egreso|Traslado|Ingreso)
      const mapTipo = (t?: string) => {
        if (!t) return undefined;
        const lower = t.toString().toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      };

      const payload: any = {
        nombreTipoMovimiento: mapTipo((data as any).tipo),
        idProducto: data.idProducto,
        cantidad: data.cantidad,
        idDepositoOrigen: data.idDepositoOrigen,
        idDepositoDestino: data.idDepositoDestino ?? null,
        responsable: (data as any).responsable ?? undefined,
        observaciones: data.observaciones ?? undefined,
      };

      const response = await axios.put<Movimiento>(
        `${API_BASE_URL}/movimientos`,
        payload,
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