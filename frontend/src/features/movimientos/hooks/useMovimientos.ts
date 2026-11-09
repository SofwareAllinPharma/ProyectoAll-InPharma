import { useState, useEffect, useCallback } from 'react';
import type { Movimiento, MovimientoFilters, MovimientosResumen } from '../types/movimiento.types';
import { MovimientoService } from '../services/movimiento.service';

export function useMovimientos(idDeposito?: number) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [resumen, setResumen] = useState<MovimientosResumen>({
    total: 0,
    egresos: 0,
    traslados: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFromApi = useCallback(async (filters?: MovimientoFilters) => {
    setLoading(true);
    setError(null);
    try {
      // Validación de rango de fechas en el cliente
      if (filters?.fechaDesde && filters?.fechaHasta) {
        const from = new Date(filters.fechaDesde);
        const to = new Date(filters.fechaHasta);
        if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from > to) {
          setMovimientos([]);
          setResumen(calculateResumen([]));
          setError('La fecha Desde no puede ser posterior a la fecha Hasta');
          return;
        }
      }
      const finalFilters = { ...(filters || {}), ...(idDeposito ? { idDeposito } : {}) } as MovimientoFilters;
      const data = await MovimientoService.getAllMovimientos(finalFilters);
      // Aplicar filtro por tipo en cliente (el backend no lo soporta aún)
      const dataFiltrada = finalFilters.tipo ? (data || []).filter(m => m.tipo === finalFilters.tipo) : (data || []);
      // Ordenar por fecha de actualización (desc). Si no hay, usar fecha de creación como fallback.
      const toTs = (s?: string | null) => {
        if (!s) return 0;
        const d = new Date(s);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      const sorted = (dataFiltrada || []).slice().sort((a, b) => {
        const tb = toTs(b.fechaActualizacion ?? b.fechaCreacion);
        const ta = toTs(a.fechaActualizacion ?? a.fechaCreacion);
        return tb - ta;
      });
      setMovimientos(sorted);
      setResumen(calculateResumen(sorted));
    } catch (err: unknown) {
      console.error('Error cargando movimientos desde API:', err);
      const msg = (err as { message?: string })?.message || 'Error cargando movimientos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [idDeposito]);

  useEffect(() => {
    void loadFromApi();
  }, [loadFromApi]);

  const filtrarMovimientos = useCallback(async (filters: MovimientoFilters) => {
    await loadFromApi(filters);
  }, [loadFromApi]);

  const recargar = useCallback(async () => {
    await loadFromApi();
  }, [loadFromApi]);

  return {
    movimientos,
    resumen,
    loading,
    error,
    filtrarMovimientos,
    recargar
  };
}

function calculateResumen(movimientos: Movimiento[]): MovimientosResumen {
  return {
    total: movimientos.length,
    egresos: movimientos.filter(m => m.tipo === 'EGRESO').length,
    traslados: movimientos.filter(m => m.tipo === 'TRASLADO').length
  };
}
