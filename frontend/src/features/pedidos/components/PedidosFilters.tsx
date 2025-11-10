import React from 'react';

type EstadoFiltro = '' | 'creado' | 'enelaboracion' | 'elaboradoydepositadoenfabrica' | 'cancelado';

interface PedidosFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  estadoFilter: EstadoFiltro;
  onEstadoChange: (value: EstadoFiltro) => void;
}

const PedidosFilters: React.FC<PedidosFiltersProps> = ({
  search,
  onSearchChange,
  estadoFilter,
  onEstadoChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar pedido..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] disabled:bg-gray-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={estadoFilter}
            onChange={(e) => {
              const v = e.target.value as EstadoFiltro;
              const allow: EstadoFiltro[] = ['', 'creado', 'enelaboracion', 'elaboradoydepositadoenfabrica', 'cancelado'];
              onEstadoChange(allow.includes(v) ? v : '');
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] disabled:bg-gray-100"
          >
            <option value="">Todos los estados</option>
            <option value="creado">Creado</option>
            <option value="enelaboracion">En elaboración</option>
            <option value="elaboradoydepositadoenfabrica">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PedidosFilters;
