// Exportar la página principal
export { default as ProductosPage } from './pages/ProductosPage';

// Exportar tipos
export type {
  Producto,
  CreateProductoRequest,
  UpdateProductoRequest,
  ProductoModalAction,
  ProductCalculation,
  ProductoSearchFilters,
} from './types/producto.types';

// Exportar servicio
export { ProductoService } from './services/producto.service';

// Exportar componentes
export { ProductosTable } from './components/table/ProductosTable';
export { ProductoSearchBar } from './components/ProductoSearchBar';
export { ProductoFormModal } from './components/form/ProductoFormModal';
export { DeleteConfirmModal } from './components/DeleteConfirmModal';