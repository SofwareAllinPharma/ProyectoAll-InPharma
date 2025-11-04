import axios from 'axios';
import type { 
  Movimiento, 
  CreateMovimientoRequest, 
  // UpdateEstadoMovimientoRequest,
  MovimientoFilters,
  MovimientosResumen
} from '../types/movimiento.types';
import type { MovimientoDetalle, MovimientoHistorialEvent } from '../types/movimiento.detalle.types.ts';

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
      type RawMovimiento = {
        idMovimiento?: number;
        id?: number;
        producto?: string | { nombreComercial?: string; nombre?: string };
        depositoOrigen?: string | { nombre?: string };
        depositoDestino?: string | { nombre?: string } | null;
        estado?: string | null;
        tipo?: string | null;
        nombreTipoMovimiento?: string | null;
        idProducto?: number;
        cantidad?: number;
        idDepositoOrigen?: number;
        idDepositoDestino?: number | null;
        referencia?: string | null;
        observaciones?: string | null;
        fechaCreacion?: string;
        fechaHoraActualizacion?: string | null;
        idUsuario?: number;
        usuario?: { id?: number; nombre?: string } | null;
        responsable?: string | null;
      };
      const params = new URLSearchParams();
      
      // Backend expects: producto, idEstado, idDeposito, fechaDesde/hasta, page, limit
      if (filters?.idDeposito) params.append('idDeposito', String(filters.idDeposito));
      if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
      if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
      if (filters?.search) params.append('producto', filters.search);
      if (filters?.estado) {
        const mapEstadoId: Record<string, number> = {
          CREADO: 1,
          EN_CAMINO: 2,
          ENTREGADO: 3,
          CANCELADO: 4,
        } as const;
        const idEstado = mapEstadoId[filters.estado];
        if (idEstado) params.append('idEstado', String(idEstado));
      }
      // Request a generous page size so client table pagination works smoothly
      params.append('page', '1');
      params.append('limit', '100');

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
        if (norm.includes('creado') || norm.includes('cread')) return 'CREADO';
        if (norm.includes('encamino') || norm.includes('encam')) return 'EN_CAMINO';
        if (norm.includes('entregado')) return 'ENTREGADO';
        if (norm.includes('cancelado')) return 'CANCELADO';
        return 'EN_CAMINO';
      };

      const normalizeTipo = (t?: string | null, item?: RawMovimiento) => {
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

      const buildReferencia = (item: RawMovimiento): string => {
        const tipo = normalizeTipo(item.tipo ?? item.nombreTipoMovimiento ?? undefined, item);
        const getNombre = (d?: string | { nombre?: string } | null): string | undefined => {
          if (!d) return undefined;
          return typeof d === 'string' ? d : d.nombre;
        };
        const depOri = getNombre(item.depositoOrigen);
        const depDes = getNombre(item.depositoDestino);
        // Casual y entendible para el usuario
        if (tipo === 'EGRESO') return `Venta desde ${depOri ?? 'N/A'}`;
        if (tipo === 'TRASLADO') return `Traslado de ${depOri ?? 'N/A'} a ${depDes ?? 'N/A'}`;
        if (tipo === 'INGRESO') return `Ingreso a ${depDes ?? depOri ?? 'N/A'}`;
        return '';
      };

      // Mapear cada elemento al tipo Movimiento esperado por el frontend
      const mapped: Movimiento[] = (rawList as RawMovimiento[]).map((it) => {
        const id = it.idMovimiento ?? it.id ?? 0;
  const productoNombre = typeof it.producto === 'string' ? it.producto : (it.producto?.nombreComercial ?? it.producto?.nombre ?? undefined);
        const getNombre = (d?: string | { nombre?: string } | null): string | null => {
          if (!d) return null;
          return (typeof d === 'string' ? d : (d?.nombre ?? null)) as string | null;
        };
        const depositoOrigenNombre = getNombre(it.depositoOrigen);
        const depositoDestinoNombre = getNombre(it.depositoDestino);

        const estadoNorm = normalizeEstado(it.estado);
        const tipoNorm = normalizeTipo(it.tipo ?? it.nombreTipoMovimiento ?? undefined, it);

        const movimiento: Movimiento = {
          id: id,
          tipo: tipoNorm as 'EGRESO' | 'TRASLADO' | 'INGRESO',
          idProducto: it.idProducto ?? 0,
          cantidad: it.cantidad ?? 0,
          idDepositoOrigen: it.idDepositoOrigen ?? 0,
          idDepositoDestino: it.idDepositoDestino ?? null,
          referencia: buildReferencia(it),
          observaciones: it.observaciones ?? null,
          estado: estadoNorm as 'CREADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO',
          fechaCreacion: it.fechaCreacion ?? '',
          fechaActualizacion: it.fechaHoraActualizacion ?? null,
          idUsuario: it.idUsuario ?? 0,
          responsable: it.responsable ?? (it.usuario?.nombre ?? undefined),
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
  return await this.getAllMovimientos({ idDeposito } as MovimientoFilters);
    } catch (error) {
      console.error('Error obteniendo movimientos del depósito:', error);
      throw error;
    }
  }

  static async getMovimientoDetalle(id: number): Promise<MovimientoDetalle> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/movimientos/${id}`,
        { headers: this.getHeaders() }
      );
      const d = response.data;
      // Map backend detalle -> MovimientoDetalle (fechas ya vienen dd/mm/yy)
      const historial: MovimientoHistorialEvent[] = Array.isArray(d.cambiosDeEstado) ? d.cambiosDeEstado.map((e: { idCambioEstadoMovimiento: number; nombreEstado?: string | null; fechaHoraInicio?: string | null; fechaHoraFin?: string | null; }) => ({
        id: e.idCambioEstadoMovimiento,
        estado: (e.nombreEstado || '').toString().toUpperCase().replace(/\s+/g, '_') as MovimientoHistorialEvent['estado'],
        fechaInicio: e.fechaHoraInicio ?? '-',
        fechaFin: e.fechaHoraFin ?? null,
        responsable: d.responsable || undefined,
        observaciones: d.observaciones || undefined,
      })) : [];
      const detalle: MovimientoDetalle = {
        id: d.idMovimiento,
        tipo: (d.tipoMovimiento?.nombre || '').toString().toUpperCase() as MovimientoDetalle['tipo'],
        productoNombre: d.producto?.nombreComercial ?? 'N/A',
        estado: (d.estado || '').toString().toUpperCase().replace(/\s+/g, '_') as MovimientoDetalle['estado'],
        cantidad: d.cantidad ?? 0,
        depositoOrigenNombre: d.depositoOrigen?.nombre ?? null,
        depositoDestinoNombre: d.depositoDestino?.nombre ?? null,
        fechaCreacion: d.fechaCreacion ?? '-',
        responsable: d.responsable ?? undefined,
        observaciones: d.observaciones ?? undefined,
        referencia: undefined, // referencia no viene del backend detalle actual
        historial,
      };
      return detalle;
    } catch (error) {
      console.error('Error obteniendo detalle de movimiento:', error);
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

      const payload: Record<string, unknown> = {
        nombreTipoMovimiento: mapTipo(data.tipo),
        idProducto: data.idProducto,
        cantidad: data.cantidad,
        idDepositoOrigen: data.idDepositoOrigen,
        idDepositoDestino: data.idDepositoDestino ?? null,
        responsable: data.responsable ?? undefined,
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
    data: { estado: 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO'; responsable: string; observaciones?: string }
  ): Promise<MovimientoDetalle> {
    try {
      const payload = {
        nombreEstado: data.estado.replace(/_/g, ' ').replace(/EN CAMINO/, 'En Camino').replace(/ENTREGADO/, 'Entregado').replace(/CANCELADO/, 'Cancelado'),
        usuario: data.responsable,
        observaciones: data.observaciones
      } as Record<string, unknown>;
      await axios.post(
        `${API_BASE_URL}/movimientos/${id}/estado`,
        payload,
        { headers: this.getHeaders() }
      );
      // backend devuelve el detalle del movimiento actualizado
      const updated = await this.getMovimientoDetalle(id);
      return updated;
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