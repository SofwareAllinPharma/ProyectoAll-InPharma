import { useState, useEffect } from 'react';
import type { Insumo, CreateInsumoDto } from '../types/insumo.types';
import { InsumoService } from '../services/insumo.service';
import InsumosTable from '../components/InsumosTable';
import SearchBar from '../components/SearchBar';
import InsumoActionModal from '../components/InsumoActionModal';
import InsumoFormModal from '../components/InsumoFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Cargar insumos al montar el componente
  useEffect(() => {
    loadInsumos();
  }, []);

  const loadInsumos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await InsumoService.getAllInsumos();
      setInsumos(data);
    } catch (err) {
      setError('Error al cargar los insumos. Por favor, intente nuevamente.');
      console.error('Error loading insumos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInsumoDoubleClick = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    setActionModalOpen(true);
  };

  const handleActionModalEdit = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    setActionModalOpen(false);
    setFormModalOpen(true);
  };

  const handleActionModalDelete = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    setActionModalOpen(false);
    setDeleteModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedInsumo(null);
    setFormModalOpen(true);
  };

  const handleFormSave = async (insumoData: CreateInsumoDto) => {
    try {
      setFormLoading(true);
      
      if (selectedInsumo) {
        // Editar insumo existente
        await InsumoService.updateInsumo(selectedInsumo.id, insumoData);
      } else {
        // Crear nuevo insumo
        await InsumoService.createInsumo(insumoData);
      }
      
      setFormModalOpen(false);
      setSelectedInsumo(null);
      await loadInsumos(); // Recargar la lista
    } catch (err) {
      setError(`Error al ${selectedInsumo ? 'actualizar' : 'crear'} el insumo. Por favor, intente nuevamente.`);
      console.error('Error saving insumo:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async (insumo: Insumo) => {
    try {
      setFormLoading(true);
      await InsumoService.deleteInsumo(insumo.id);
      setDeleteModalOpen(false);
      setSelectedInsumo(null);
      await loadInsumos(); // Recargar la lista
    } catch (err) {
      setError('Error al eliminar el insumo. Por favor, intente nuevamente.');
      console.error('Error deleting insumo:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const closeAllModals = () => {
    setActionModalOpen(false);
    setFormModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedInsumo(null);
  };

  const dismissError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insumos</h1>
            <p className="text-sm text-gray-600 mt-1">Gestiona el inventario de insumos de la fábrica</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-[#5d5448]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Cargando insumos...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con título y botón agregar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insumos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona el inventario de insumos de la fábrica
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="
            px-4 py-2 rounded-lg 
            bg-[#5d5448] text-white 
            hover:bg-[#5d5448]/90 
            focus:ring-2 focus:ring-[#5d5448]/50 focus:outline-none
            transition-all duration-200
            flex items-center gap-2
          "
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Insumo
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
            <button
              onClick={dismissError}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          placeholder="Buscar por nombre del insumo..."
        />
      </div>

      {/* Tabla de insumos */}
      <InsumosTable
        insumos={insumos}
        onInsumoDoubleClick={handleInsumoDoubleClick}
        searchTerm={searchTerm}
      />

      {/* Información adicional */}
      <div className="text-center text-sm text-gray-500">
        <p>💡 <strong>Tip:</strong> Haz doble clic en cualquier fila para editar o eliminar un insumo</p>
      </div>

      {/* Modales */}
      <InsumoActionModal
        open={actionModalOpen}
        insumo={selectedInsumo}
        onEdit={handleActionModalEdit}
        onDelete={handleActionModalDelete}
        onCancel={closeAllModals}
      />

      <InsumoFormModal
        open={formModalOpen}
        insumo={selectedInsumo}
        onSave={handleFormSave}
        onCancel={closeAllModals}
        loading={formLoading}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        insumo={selectedInsumo}
        onConfirm={handleDeleteConfirm}
        onCancel={closeAllModals}
        loading={formLoading}
      />
    </div>
  );
}