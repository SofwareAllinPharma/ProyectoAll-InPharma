// Exportar la página principal
export { ProductosPage } from './pages/ProductosPage';

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
export { ProductosTable } from './components/ProductosTable';
export { ProductoSearchBar } from './components/ProductoSearchBar';
export { ProductoFormModal } from './components/ProductoFormModal';
export { ProductoActionModal } from './components/ProductoActionModal';
export { DeleteConfirmModal } from './components/DeleteConfirmModal';