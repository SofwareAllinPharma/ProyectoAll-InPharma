import { useState, useEffect, useCallback } from 'react';
import type { Movimiento, MovimientoFilters, MovimientosResumen } from '../types/movimiento.types';
import { generateMockMovimientos } from '../utils/mockMovimientos';

export function useMovimientos(idDeposito?: number) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [resumen, setResumen] = useState<MovimientosResumen>({
    total: 0,
    egresos: 0,
    traslados: 0
  });
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const loadMockData = useCallback(() => {
    setLoading(true);
    
    setTimeout(() => {
      const mockMovimientos = generateMockMovimientos(idDeposito);
      setMovimientos(mockMovimientos);
      setResumen(calculateResumen(mockMovimientos));
      setLoading(false);
    }, 500);
  }, [idDeposito]);

  useEffect(() => {
    loadMockData();
  }, [loadMockData]);

  const filtrarMovimientos = (filters: MovimientoFilters) => {
    const mockMovimientos = generateMockMovimientos(idDeposito);
    let filtered = [...mockMovimientos];

    if (filters.tipo) {
      filtered = filtered.filter(m => m.tipo === filters.tipo);
    }

    if (filters.estado) {
      filtered = filtered.filter(m => m.estado === filters.estado);
    }

    if (filters.search && filters.search.trim()) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(m => 
        m.producto?.nombreComercial.toLowerCase().includes(search)
      );
    }

    setMovimientos(filtered);
    setResumen(calculateResumen(filtered));
  };

  const recargar = () => {
    loadMockData();
  };

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
