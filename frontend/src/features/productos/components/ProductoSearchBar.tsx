import React from 'react';
import UI_SearchBar from '../../../components/ui/SearchBar';
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
  


  return (
    <UI_SearchBar
      placeholder={`Buscar ${
        filters.buscarPor === 'producto'
          ? 'por nombre de producto...'
          : filters.buscarPor === 'formula'
          ? 'por nombre de fórmula...'
          : 'por nombre de insumo...'
      }`}
      searchTerm={filters.search || ''}
      debounceMs={300}
      onSearch={(q) => {
        onFiltersChange({ ...filters, search: q });
        onSearch();
      }}
      className="w-full"
      rightNode={(
        <select
          value={filters.buscarPor}
          onChange={(e) => { onFiltersChange({ ...filters, buscarPor: e.target.value as ProductoSearchFilters['buscarPor'] }); onSearch(); }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] text-sm bg-white"
          disabled={isLoading}
        >
          <option value="producto">Por Producto</option>
          <option value="formula">Por Fórmula</option>
          <option value="insumo">Por Insumo</option>
        </select>
      )}
    />
  );
};