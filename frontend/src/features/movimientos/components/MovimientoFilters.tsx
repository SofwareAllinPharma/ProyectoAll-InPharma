import type { MovimientoFilters } from '../types/movimiento.types';

interface Props {
  filters: MovimientoFilters;
  onFiltersChange: (filters: MovimientoFilters) => void;
  disabled?: boolean;
}

export default function MovimientoFilters({ filters, onFiltersChange, disabled }: Props) {
  
  const handleChange = (key: keyof MovimientoFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar producto
          </label>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de movimiento
          </label>
          <select
            value={filters.tipo || ''}
            onChange={(e) => handleChange('tipo', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] disabled:bg-gray-100"
          >
            <option value="">Todos los tipos</option>
            <option value="EGRESO">Egresos (Salidas)</option>
            <option value="TRASLADO">Traslados</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filters.estado || ''}
            onChange={(e) => handleChange('estado', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] disabled:bg-gray-100"
          >
            <option value="">Todos los estados</option>
            <option value="EN_CAMINO">En Camino</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

      </div>

      {(filters.search || filters.tipo || filters.estado) && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => onFiltersChange({ search: '', tipo: '', estado: '' })}
            disabled={disabled}
            className="text-sm text-[#5d5448] hover:text-[#5d5448]/70 disabled:opacity-50"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}