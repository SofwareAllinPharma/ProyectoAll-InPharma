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
      setMovimientos(data || []);
      setResumen(calculateResumen(data || []));
    } catch (err: any) {
      console.error('Error cargando movimientos desde API:', err);
      setError(err?.message || 'Error cargando movimientos');
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
