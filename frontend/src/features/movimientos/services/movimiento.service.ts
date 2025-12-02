import { api } from '../../../lib/api';
import type { 
  Movimiento, 
  CreateMovimientoRequest, 
  // UpdateEstadoMovimientoRequest,
  MovimientoFilters,
  MovimientosResumen
} from '../types/movimiento.types';
import type { MovimientoDetalle, MovimientoHistorialEvent } from '../types/movimiento.detalle.types.ts';

export class MovimientoService {
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
      // Normalizar fechas para asegurar que 'Hasta' sea inclusiva (23:59:59.999)
      const normalizeFrom = (d?: string) => {
        if (!d) return undefined;
        // Para valores 'YYYY-MM-DD' fijamos inicio del día local
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${d}T00:00:00.000`;
        return d;
      };
      const normalizeTo = (d?: string) => {
        if (!d) return undefined;
        // Para valores 'YYYY-MM-DD' fijamos fin del día local
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${d}T23:59:59.999`;
        return d;
      };
      const from = normalizeFrom(filters?.fechaDesde);
      const to = normalizeTo(filters?.fechaHasta);
      if (from) params.append('fechaDesde', from);
      if (to) params.append('fechaHasta', to);
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
      const url = `/movimientos${queryString ? `?${queryString}` : ''}`;

      const { data: respData } = await api.get(url);

      // Normalizar distintos formatos que el backend puede devolver:
      // - lista directa: []
      // - paginado: { data: [], meta: { ... } }
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

      // Helper para HH:MM a partir de ISO o fecha parseable
      const toHour = (s?: string | null): string | null => {
        if (!s) return null;
        const d = new Date(s);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
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
          horaActualizacion: toHour(it.fechaHoraActualizacion),
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
      const { data: d } = await api.get(`/movimientos/${id}`);
      // Map backend detalle -> MovimientoDetalle (fechas ya vienen dd/mm/yy)
      const historial: MovimientoHistorialEvent[] = Array.isArray(d.cambiosDeEstado) ? d.cambiosDeEstado.map((e: { idCambioEstadoMovimiento: number; nombreEstado?: string | null; fechaHoraInicio?: string | null; fechaHoraFin?: string | null; responsable?: string | null; responsableEntrega?: string | null; responsableRecepcion?: string | null; observaciones?: string | null; }) => ({
        id: e.idCambioEstadoMovimiento,
        estado: (e.nombreEstado || '').toString().toUpperCase().replace(/\s+/g, '_') as MovimientoHistorialEvent['estado'],
        fechaInicio: e.fechaHoraInicio ?? '-',
        fechaFin: e.fechaHoraFin ?? null,
        responsable: e.responsable || undefined,
        responsableEntrega: e.responsableEntrega || undefined,
        responsableRecepcion: e.responsableRecepcion || undefined,
        observaciones: e.observaciones || undefined,
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

      const { data: responseData } = await api.put<Movimiento>('/movimientos', payload);
      return responseData;
    } catch (error) {
      console.error('Error creando movimiento:', error);
      throw error;
    }
  }

  static async updateEstadoMovimiento(
    id: number,
    data: (
      { estado: 'EN_CAMINO' | 'CANCELADO'; responsable: string; observaciones?: string } |
      { estado: 'ENTREGADO'; responsableEntrega: string; responsableRecepcion: string; observaciones?: string }
    )
  ): Promise<MovimientoDetalle> {
    try {
      const nombreEstado = (data as any).estado.replace(/_/g, ' ').replace(/EN CAMINO/, 'En Camino').replace(/ENTREGADO/, 'Entregado').replace(/CANCELADO/, 'Cancelado');
      const isEntregado = nombreEstado.toLowerCase().includes('entregado');
      const payload: Record<string, unknown> = { nombreEstado, observaciones: (data as any).observaciones };
      if (isEntregado) {
        payload.responsableEntrega = (data as any).responsableEntrega;
        payload.responsableRecepcion = (data as any).responsableRecepcion;
      } else {
        payload.usuario = (data as any).responsable;
      }
      await api.post(`/movimientos/${id}/estado`, payload);
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
        ? `/movimientos/resumen?idDeposito=${idDeposito}`
        : `/movimientos/resumen`;

      const { data } = await api.get<MovimientosResumen>(url);

      return data;
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
      const { data } = await api.post<{ valido: boolean; mensaje?: string }>(
        '/movimientos/validar-stock',
        { idDeposito, idProducto, cantidad }
      );
      return data;
    } catch (error) {
      console.error('Error validando stock:', error);
      return { 
        valido: false, 
        mensaje: 'Error al validar stock' 
      };
    }
  }

  static async deleteMovimiento(id: number): Promise<{ ok: boolean }> {
    try {
      await api.delete(`/movimientos/${id}`);
      return { ok: true };
    } catch (error) {
      console.error('Error eliminando movimiento:', error);
      throw error;
    }
  }
}