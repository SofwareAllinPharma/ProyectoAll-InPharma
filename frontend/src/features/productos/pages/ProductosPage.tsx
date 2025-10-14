import React, { useState, useEffect, useCallback } from 'react';
import { ProductosTable } from '../components/ProductosTable';
import { ProductoSearchBar } from '../components/ProductoSearchBar';
import { ProductoFormModal } from '../components/ProductoFormModal';
import { ProductoActionModal } from '../components/ProductoActionModal';
import { ProductoNutritionalModal } from '../components/ProductoNutritionalModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ProductoService } from '../services/producto.service';
import type { 
  Producto, 
  ProductoSearchFilters, 
  ProductoModalAction,
  CreateProductoRequest,
  UpdateProductoRequest
} from '../types/producto.types';

export const ProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [filters, setFilters] = useState<ProductoSearchFilters>({
    search: '',
    buscarPor: 'producto',
  });

  // Estados para modales
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showNutritionalModal, setShowNutritionalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar productos - función interna sin useCallback para evitar dependencias circulares
  const loadProductos = async (searchFilters?: ProductoSearchFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const filtersToUse = searchFilters || { search: '', buscarPor: 'producto' as const };
      const data = await ProductoService.getAllProductos(filtersToUse);
      setProductos(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setProductos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar productos al montar el componente (sin filtros)
  useEffect(() => {
    loadProductos({ search: '', buscarPor: 'producto' });
  }, []); // Solo se ejecuta al montar

  // Manejar búsqueda manual
  const handleSearch = useCallback(() => {
    loadProductos(filters);
  }, [filters]);

  // Mostrar información nutricional
  const handleShowNutrition = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowNutritionalModal(true);
  };

  // Manejar acciones del producto
  const handleProductoAction = (action: ProductoModalAction) => {
    switch (action.type) {
      case 'view':
        setSelectedProducto(action.producto || null);
        setShowActionModal(true);
        break;
      case 'edit':
        setSelectedProducto(action.producto || null);
        setShowFormModal(true);
        break;
      case 'delete':
        setSelectedProducto(action.producto || null);
        setShowDeleteModal(true);
        break;
      case 'cancel':
        closeModals();
        break;
      default:
        break;
    }
  };

  // Crear producto
  const handleCreateProducto = async (data: CreateProductoRequest) => {
    setIsSubmitting(true);
    try {
      await ProductoService.createProducto(data);
      await loadProductos(filters);
      setShowFormModal(false);
      setSelectedProducto(null);
    } catch (err) {
      console.error('Error al crear producto:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar producto
  const handleUpdateProducto = async (data: UpdateProductoRequest) => {
    if (!selectedProducto) return;
    
    setIsSubmitting(true);
    try {
      await ProductoService.updateProducto(selectedProducto.idProducto, data);
      await loadProductos(filters);
      setShowFormModal(false);
      setSelectedProducto(null);
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar producto
  const handleDeleteProducto = async () => {
    if (!selectedProducto) return;

    setIsSubmitting(true);
    try {
      await ProductoService.deleteProducto(selectedProducto.idProducto);
      await loadProductos(filters);
      setShowDeleteModal(false);
      setSelectedProducto(null);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (data: CreateProductoRequest | UpdateProductoRequest) => {
    if (selectedProducto) {
      await handleUpdateProducto(data as UpdateProductoRequest);
    } else {
      await handleCreateProducto(data as CreateProductoRequest);
    }
  };

  // Cerrar modales
  const closeModals = () => {
    setShowFormModal(false);
    setShowActionModal(false);
    setShowNutritionalModal(false);
    setShowDeleteModal(false);
    setSelectedProducto(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600">
            Administra los productos de la fábrica y sus fórmulas asociadas
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProducto(null);
            setShowFormModal(true);
          }}
          className="px-4 py-2 bg-[#7c6a55] text-white rounded-md hover:bg-[#6b5847] 
                   transition-colors font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filtros de búsqueda */}
      <ProductoSearchBar
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 p-1"
              title="Cerrar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
      <ProductosTable
        productos={productos}
        onProductoAction={handleProductoAction}
        onShowNutrition={handleShowNutrition}
        isLoading={isLoading}
      />

      {/* Estado vacío */}
      {!isLoading && productos.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
          <p className="text-gray-500 mb-6">
            {filters.search.trim() ? 'No se encontraron productos con los filtros aplicados.' : 'Aún no tienes productos registrados en el sistema.'}
          </p>
          <button
            onClick={() => {
              setSelectedProducto(null);
              setShowFormModal(true);
            }}
            className="px-4 py-2 bg-[#7c6a55] text-white rounded-md hover:bg-[#6b5847] transition-colors font-medium inline-flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Crear primer producto</span>
          </button>
        </div>
      )}

      {/* Estadísticas */}
      {!isLoading && productos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Total de productos: <strong>{productos.length}</strong>
            </span>
            <span>
              Activos: <strong>{productos.filter(p => p.estaActivo).length}</strong>
            </span>
            <span>
              Inactivos: <strong>{productos.filter(p => !p.estaActivo).length}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Modales */}
      <ProductoFormModal
        isOpen={showFormModal}
        onClose={closeModals}
        onSubmit={handleFormSubmit}
        producto={selectedProducto ?? undefined}
        isLoading={isSubmitting}
      />

      <ProductoActionModal
        isOpen={showActionModal}
        producto={selectedProducto}
        onEdit={() => {
          setShowActionModal(false);
          setShowFormModal(true);
        }}
        onDelete={() => {
          setShowActionModal(false);
          setShowDeleteModal(true);
        }}
        onClose={() => setShowActionModal(false)}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        producto={selectedProducto}
        onConfirm={handleDeleteProducto}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isSubmitting}
      />

      <ProductoNutritionalModal
        isOpen={showNutritionalModal}
        producto={selectedProducto}
        onClose={closeModals}
      />
    </div>
  );
};
