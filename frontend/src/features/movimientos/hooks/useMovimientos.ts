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
      const finalFilters = { ...(filters || {}), ...(idDeposito ? { idDeposito } : {}) } as MovimientoFilters;
      const data = await MovimientoService.getAllMovimientos(finalFilters);
      // Aplicar filtro por tipo en cliente (el backend no lo soporta aún)
      const dataFiltrada = finalFilters.tipo ? (data || []).filter(m => m.tipo === finalFilters.tipo) : (data || []);
      // Ordenar: todos menos CANCELADO primero, CANCELADO al final (manteniendo orden original entre iguales)
      const sorted = (dataFiltrada || []).slice().sort((a, b) => {
        const aC = a.estado === 'CANCELADO' ? 1 : 0;
        const bC = b.estado === 'CANCELADO' ? 1 : 0;
        if (aC !== bC) return aC - bC; // 0 before 1 -> cancelados al final
        return 0;
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
