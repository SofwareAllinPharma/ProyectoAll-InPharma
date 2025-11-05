import { useState, useEffect, useRef } from 'react';
import MovimientosCards from '../components/MovimientosCards';
import MovimientoFilters from '../components/MovimientoFilters';
import MovimientosTable from '../components/MovimientosTable';
import { useMovimientos } from '../hooks/useMovimientos';
import type { MovimientoFilters as IMovimientoFilters, Movimiento } from '../types/movimiento.types';
import RegistroMovimientoModal from '../components/alta/RegistroMovimientoModal';
import MovimientoDetailModal from '../components/detalle/MovimientoDetailModal';

interface Props {
  idDeposito?: number; 
}

export default function MovimientosTab({ idDeposito }: Props) {
  const { 
    movimientos, 
    resumen, 
    loading,
    filtrarMovimientos,
    recargar
  } = useMovimientos(idDeposito);

  const [filters, setFilters] = useState<IMovimientoFilters>({
    search: '',
    tipo: '',
    estado: '',
    idDeposito: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Evitar doble llamada al cargar la pestaña (mount):
  // useMovimientos ya hace una carga inicial; este debounce para filtros
  // se saltea la primera vez para no duplicar requests
  const firstFiltersEffect = useRef(true);
  useEffect(() => {
    if (firstFiltersEffect.current) {
      firstFiltersEffect.current = false;
      return;
    }
    // Debounce filter changes to avoid blocking typing and rapid re-requests
    const t = setTimeout(() => {
      void filtrarMovimientos(filters);
    }, 300);
    return () => clearTimeout(t);
  }, [filters, filtrarMovimientos]);

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [movSel, setMovSel] = useState<Movimiento | null>(null);
  const handleVerDetalle = (movimiento: Movimiento) => {
    setMovSel(movimiento);
    setDetalleOpen(true);
  };


  const [openRegistroModal, setOpenRegistroModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {idDeposito 
              ? 'Movimientos de Stock' 
              : 'Movimientos Globales de Stock'
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
          onClick={() => setOpenRegistroModal(true)}
          className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition-all flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nuevo Movimiento</span>
        </button>
  <RegistroMovimientoModal open={openRegistroModal} onClose={() => setOpenRegistroModal(false)} onCreated={() => { void recargar(); }} />
      </div>

  <MovimientosCards resumen={resumen} loading={loading} />
      
      <MovimientoFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <MovimientosTable
          data={movimientos}
          loading={loading}
          onVerDetalle={handleVerDetalle}
          onDeleted={() => { void recargar(); }}
        />
      </div>

      <MovimientoDetailModal open={detalleOpen} onClose={() => setDetalleOpen(false)} movimiento={movSel} onEstadoChanged={() => { void recargar(); }} />
    </div>
  );
}
