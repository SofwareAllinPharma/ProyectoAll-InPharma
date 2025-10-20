import React, { useState, useEffect, useCallback } from 'react';
import PageShell from '../../../components/PageShell';
import { ProductosTable } from '../components/table/ProductosTable';
import { ProductoSearchBar } from '../components/ProductoSearchBar';
import { ProductoFormModal } from '../components/form/ProductoFormModal';
import { ProductoNutritionalModal } from '../components/ProductoNutritionalModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ProductoService } from '../services/producto.service';
import type {
  Producto,
  ProductoSearchFilters,
  ProductoModalAction,
} from '../types/producto.types';

const ProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProductoSearchFilters>({ search: '', buscarPor: 'producto' });
  const [selected, setSelected] = useState<Producto | null>(null);
  const [modals, setModals] = useState({ form: false, action: false, nutr: false, del: false });
  const [submitting] = useState(false);

  const load = async (filt?: ProductoSearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ProductoService.getAllProductos(filt ?? filters);
      setProductos(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      setProductos([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);
  const onSearch = useCallback(() => void load(filters), [filters]);

  const closeAll = () => setModals({ form: false, action: false, nutr: false, del: false });

  const handleProductoAction = (action: ProductoModalAction) => {
    setSelected(action.producto ?? null);
    if (action.type === 'view') {
      // abrir vista/consultar -> mostramos modal nutricional
      setModals(s => ({ ...s, nutr: true }));
    } else if (action.type === 'edit') {
      setModals(s => ({ ...s, form: true }));
    } else if (action.type === 'delete') {
      setModals(s => ({ ...s, del: true }));
    }
  };

  return (
    <PageShell
      title="Productos"
      subtitle="Gestiona los productos"
      onCreate={() => setModals(s => ({ ...s, form: true }))}
      createLabel="Nuevo Producto"
      loading={loading}
      noContainer
      searchNode={<ProductoSearchBar filters={filters} onFiltersChange={setFilters} onSearch={onSearch} isLoading={loading} />}
      modals={(
        <>
          <ProductoFormModal isOpen={modals.form} onClose={closeAll} onSubmit={async () => {}} producto={selected ?? undefined} isLoading={submitting} />
          <ProductoNutritionalModal isOpen={modals.nutr} producto={selected} onClose={closeAll} />
          <DeleteConfirmModal isOpen={modals.del} producto={selected} onConfirm={() => {}} onCancel={() => setModals(s => ({ ...s, del: false }))} isLoading={submitting} />
        </>
      )}
    >
      {error && <div className="text-sm text-red-600">{error}</div>}

  <ProductosTable productos={productos} onProductoAction={handleProductoAction} isLoading={loading} />
    </PageShell>
  );
};

export default ProductosPage;
