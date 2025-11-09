import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTruck } from 'react-icons/fa';
import Button from '../../../components/ui/Button';
import MovimientosCards from '../components/MovimientosCards';
import MovimientoFilters from '../components/MovimientoFilters';
import MovimientosTable from '../components/MovimientosTable';
import { useMovimientos } from '../hooks/useMovimientos';
import type { MovimientoFilters as IMovimientoFilters, Movimiento } from '../types/movimiento.types';
import RegistroMovimientoModal from '../components/alta/RegistroMovimientoModal';

interface Props {
  idDeposito?: number;
  onShowTraslado?: () => void; 
}

export default function MovimientosTab({ idDeposito, onShowTraslado }: Props) {
  const navigate = useNavigate();
  const {
    movimientos,
    resumen, 
    loading,
    error,
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

  const firstFiltersEffect = useRef(true);
  useEffect(() => {
    if (firstFiltersEffect.current) {
      firstFiltersEffect.current = false;
      return;
    }
    if (filters.fechaDesde && filters.fechaHasta) {
      const from = new Date(filters.fechaDesde);
      const to = new Date(filters.fechaHasta);
      if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from > to) {
        return;
      }
    }
    const t = setTimeout(() => {
      void filtrarMovimientos(filters);
    }, 300);
    return () => clearTimeout(t);
  }, [filters, filtrarMovimientos]);

  const handleVerDetalle = (movimiento: Movimiento) => {
    // Determinar la ruta base según el perfil del usuario
    const perfil = localStorage.getItem('userPerfil');
    let basePath = '/adminsis';
    if (perfil === '1') basePath = '/tecnico';
    else if (perfil === '2') basePath = '/adminfab';
    else if (perfil === '3') basePath = '/adminsis';
    
    navigate(`${basePath}/movimientos/${movimiento.id}`);
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

        <Button
          variant="outline"
          title="Registrar Traslado"
          icon={<FaTruck size={16} className="text-[#7C6A55]" />}
          onClick={() => {
            onShowTraslado?.();
            setOpenRegistroModal(true);
          }}
        >
          Nuevo Movimiento
        </Button>
        <RegistroMovimientoModal open={openRegistroModal} onClose={() => setOpenRegistroModal(false)} onCreated={() => { void recargar(); }} defaultDepOrigen={idDeposito ? { id: idDeposito, nombre: '' } : undefined} />
      </div>

      <MovimientosCards resumen={resumen} loading={loading} />

      <MovimientoFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

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
