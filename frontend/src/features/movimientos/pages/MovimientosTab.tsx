import React, { useState, useEffect } from 'react';
import MovimientosCards from '../components/MovimientosCards';
import MovimientoFilters from '../components/MovimientoFilters';
import MovimientosTable from '../components/MovimientosTable';
import { useMovimientos } from '../hooks/useMovimientos';
import type { MovimientoFilters as IMovimientoFilters, Movimiento } from '../types/movimiento.types';

interface Props {
  idDeposito?: number; // ✅ Ahora es opcional
}

export default function MovimientosTab({ idDeposito }: Props) {
  const { 
    movimientos, 
    resumen, 
    loading,
    filtrarMovimientos 
  } = useMovimientos(idDeposito);

  const [filters, setFilters] = useState<IMovimientoFilters>({
    search: '',
    tipo: '',
    estado: ''
  });

  useEffect(() => {
    filtrarMovimientos(filters);
  }, [filters, filtrarMovimientos]);

  const handleVerDetalle = (movimiento: Movimiento) => {
    console.log('Ver detalle de movimiento:', movimiento);
    // TODO: Abrir modal de detalle
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {idDeposito 
              ? 'Movimientos de Inventario' 
              : 'Movimientos Globales de Inventario'
            }
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {idDeposito
              ? 'Historial de salidas y traslados del depósito'
              : 'Historial de todos los movimientos en todos los depósitos'
            }
          </p>
        </div>
        
        <button
          onClick={() => console.log('TODO: Abrir modal de nuevo movimiento')}
          className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition-all flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nuevo Movimiento</span>
        </button>
      </div>

      <MovimientosCards resumen={resumen} loading={loading} />
      
      <MovimientoFilters
        filters={filters}
        onFiltersChange={setFilters}
        disabled={loading}
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <MovimientosTable
          data={movimientos}
          loading={loading}
          onVerDetalle={handleVerDetalle}
        />
      </div>
    </div>
  );
}
