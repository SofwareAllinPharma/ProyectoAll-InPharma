import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useToast } from '../../../components/ui/toast/ToastContext';

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
  // Si hay parámetro de ruta :id, abrir modal nutricional para ese producto
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const idParam = params.id ? Number(params.id) : undefined;
    if (!idParam) return;
    // Si los productos ya cargaron, seleccionar y abrir modal
    const found = productos.find((p) => p.idProducto === idParam);
    if (found) {
      setSelected(found);
      setModals((s) => ({ ...s, nutr: true }));
    } else {
      // intenta cargar de API individualmente
      (async () => {
        try {
          const prod = await ProductoService.getProductoById(idParam);
          setSelected(prod);
          setModals((s) => ({ ...s, nutr: true }));
        } catch (e) {
          // si no existe, navegar a la lista
          navigate('/adminsis/productos', { replace: true });
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, productos]);
  const onSearch = useCallback((f?: ProductoSearchFilters) => void load(f ?? filters), [filters]);

  const { show } = useToast() as any;

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

  // Función para crear producto y recargar la lista
  const handleCreateProducto = async (data: any) => {
    try {
      await ProductoService.createProducto(data);
      show({ message: 'Producto creado correctamente', type: 'success' });
      await load();
    } catch (e) {
      show({ message: (e as Error)?.message || 'Error creando producto', type: 'error' });
      throw e;
    }
  };

  // Función para editar producto y recargar la lista
  const handleUpdateProducto = async (data: any) => {
    if (!selected) return;
    try {
      await ProductoService.updateProducto(selected.idProducto, data);
      show({ message: 'Producto actualizado correctamente', type: 'success' });
      await load();
    } catch (e) {
      show({ message: (e as Error)?.message || 'Error actualizando producto', type: 'error' });
      throw e;
    }
  };

  // Función para eliminar producto y recargar la lista
  const handleDeleteProducto = async () => {
    if (!selected) return;
    try {
      await ProductoService.deleteProducto(selected.idProducto);
      show({ message: 'Producto eliminado correctamente', type: 'success' });
      await load();
      closeAll();
    } catch (e) {
      show({ message: (e as Error)?.message || 'Error eliminando producto', type: 'error' });
      throw e;
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
          <ProductoFormModal
            isOpen={modals.form}
            onClose={closeAll}
            onSubmit={selected ? handleUpdateProducto : handleCreateProducto}
            producto={selected ?? undefined}
            isLoading={submitting}
          />
          <ProductoNutritionalModal isOpen={modals.nutr} producto={selected} onClose={closeAll} />
          <DeleteConfirmModal
            isOpen={modals.del}
            producto={selected}
            onConfirm={handleDeleteProducto}
            onCancel={() => setModals(s => ({ ...s, del: false }))}
            isLoading={submitting}
          />
        </>
      )}
    >
      {error && <div className="text-sm text-red-600">{error}</div>}

  <ProductosTable productos={productos} onProductoAction={handleProductoAction} isLoading={loading} />
    </PageShell>
  );
};

export default ProductosPage;
