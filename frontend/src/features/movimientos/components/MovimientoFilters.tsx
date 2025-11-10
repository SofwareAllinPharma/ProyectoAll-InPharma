import { useState } from 'react';
import type { MovimientoFilters } from '../types/movimiento.types';

interface Props {
  filters: MovimientoFilters;
  onFiltersChange: (filters: MovimientoFilters) => void;
}

export default function MovimientoFilters({ filters, onFiltersChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isDateRangeInvalid =
    !!filters.fechaDesde &&
    !!filters.fechaHasta &&
    new Date(filters.fechaDesde) > new Date(filters.fechaHasta);

  const handleChange = <K extends keyof MovimientoFilters>(key: K, value: MovimientoFilters[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toTipo = (v: string): MovimientoFilters['tipo'] => {
    return (v === 'EGRESO' || v === 'TRASLADO' || v === 'INGRESO') ? v : '';
  };

  const toEstado = (v: string): MovimientoFilters['estado'] => {
    return (v === 'CREADO' || v === 'EN_CAMINO' || v === 'ENTREGADO' || v === 'CANCELADO') ? v : '';
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      tipo: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setShowAdvanced(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
      {/* Top bar: search + type + advanced toggle */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar movimiento..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] disabled:bg-gray-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filters.tipo || ''}
            onChange={(e) => handleChange('tipo', toTipo(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] disabled:bg-gray-100"
          >
            <option value="">Todos los tipos</option>
            <option value="EGRESO">Egresos (Salidas)</option>
            <option value="TRASLADO">Traslados</option>
            <option value="INGRESO">Ingresos</option>
          </select>

          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            {showAdvanced ? 'Ocultar Filtros' : 'Más Filtros'}
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={filters.fechaDesde || ''}
              onChange={(e) => handleChange('fechaDesde', e.target.value)}
              aria-invalid={isDateRangeInvalid}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] disabled:bg-gray-100 ${
                isDateRangeInvalid ? 'border-red-400' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.fechaHasta || ''}
              onChange={(e) => handleChange('fechaHasta', e.target.value)}
              aria-invalid={isDateRangeInvalid}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] disabled:bg-gray-100 ${
                isDateRangeInvalid ? 'border-red-400' : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.estado || ''}
              onChange={(e) => handleChange('estado', toEstado(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] disabled:bg-gray-100"
            >
              <option value="">Todos los estados</option>
              <option value="CREADO">Creado</option>
              <option value="EN_CAMINO">En Camino</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          {isDateRangeInvalid && (
            <div className="md:col-span-3 text-sm text-red-600 -mt-2">
              La fecha Desde no puede ser posterior a la fecha Hasta.
            </div>
          )}
        </div>
      )}
    </div>
  );
}