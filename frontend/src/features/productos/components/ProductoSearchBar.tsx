import React from 'react';
import type { ProductoSearchFilters } from '../types/producto.types';

interface Props {
  filters: ProductoSearchFilters;
  onFiltersChange: (filters: ProductoSearchFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export const ProductoSearchBar: React.FC<Props> = ({
  filters,
  onFiltersChange,
  onSearch,
  isLoading = false,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleSearchTypeChange = (buscarPor: ProductoSearchFilters['buscarPor']) => {
    onFiltersChange({ ...filters, buscarPor });
  };

  const handleEstadoChange = (estado: ProductoSearchFilters['estado']) => {
    onFiltersChange({ ...filters, estado });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Campo de búsqueda */}
        <div className="flex-1">
          <input
            type="text"
            placeholder={`Buscar ${
              filters.buscarPor === 'producto' 
                ? 'por nombre de producto...' 
                : filters.buscarPor === 'formula'
                ? 'por nombre de fórmula...'
                : 'por nombre de insumo...'
            }`}
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Tipo de búsqueda */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={filters.buscarPor}
            onChange={(e) => handleSearchTypeChange(e.target.value as ProductoSearchFilters['buscarPor'])}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] text-sm"
            disabled={isLoading}
          >
            <option value="producto">Por Producto</option>
            <option value="formula">Por Fórmula</option>
            <option value="insumo">Por Insumo</option>
          </select>

          {/* Estado */}
          <select
            value={filters.estado}
            onChange={(e) => handleEstadoChange(e.target.value as ProductoSearchFilters['estado'])}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] text-sm"
            disabled={isLoading}
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          {/* Botón de búsqueda */}
          <button
            onClick={onSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-[#7c6a55] text-white rounded-md hover:bg-[#6b5847] 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Información de ayuda */}
      <div className="text-xs text-gray-500">
        <span className="font-medium">Búsqueda por:</span>
        {filters.buscarPor === 'producto' && ' Nombre comercial del producto'}
        {filters.buscarPor === 'formula' && ' Nombre de la fórmula asociada'}
        {filters.buscarPor === 'insumo' && ' Productos cuyas fórmulas contienen el insumo especificado'}
      </div>
    </div>
  );
};