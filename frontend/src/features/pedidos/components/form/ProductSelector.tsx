import React from 'react';
import type { Producto } from '../../../productos/types/producto.types';
import SearchSelect from '../../../../components/ui/SearchSelect';

interface Props {
  productos: Producto[];
  selectedId: number | null;
  setSelectedId: (v: number | null) => void;
  error?: string | undefined;
}

const ProductSelector: React.FC<Props> = ({ productos, selectedId, setSelectedId, error }) => {
  const selected = productos.find(p => p.idProducto === selectedId) ?? null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
      <div>
        <SearchSelect
          items={productos}
          value={selected}
          getKey={(p: Producto) => p.idProducto}
          getLabel={(p: Producto) => p.nombreComercial}
          onSelect={(p: Producto) => setSelectedId(p.idProducto)}
          placeholder="Buscar producto..."
          noResultsText="No se encontraron productos"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">{error}</p>}
    </div>
  );
};

export default ProductSelector;