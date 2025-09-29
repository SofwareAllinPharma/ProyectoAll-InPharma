import React, { useState, useEffect, useCallback } from 'react';
import { FormulasTable } from '../components/FormulasTableNew';
import { SearchBar } from '../components/SearchBar';
import { FormulaFormModalSimple } from '../components/FormulaFormModalSimple';
import { FormulaActionModal } from '../components/FormulaActionModal';
import { ProtectedFormulaModal } from '../components/ProtectedFormulaModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { FormulaService } from '../services/formula.service';
import type { Formula, CreateFormulaRequest } from '../types/formula.types';

const getErrorMessage = (e: unknown) =>
  e instanceof Error ? e.message : typeof e === 'string' ? e : 'Ocurrió un error inesperado';

export const FormulasPage: React.FC = () => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [filteredFormulas, setFilteredFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(false);

  // Modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [protectedModalOpen, setProtectedModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCopyMode, setIsCopyMode] = useState(false);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const loadFormulas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await FormulaService.getAllFormulas();
      setFormulas(data);
      setFilteredFormulas(data);
    } catch (error: unknown) {
      console.error('Error loading formulas:', error);
      showNotification('error', getErrorMessage(error) || 'Error al cargar las fórmulas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFormulas();
  }, [loadFormulas]);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(t);
  }, [notification]);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setFilteredFormulas(formulas);
        return;
      }
      try {
        const filtered = await FormulaService.searchFormulas(query);
        setFilteredFormulas(filtered);
      } catch (error: unknown) {
        console.error('Error searching formulas:', error);
        showNotification('error', getErrorMessage(error) || 'Error al buscar fórmulas');
      }
    },
    [formulas]
  );

  const handleFormulaAction = (formula: Formula) => {
    setSelectedFormula(formula);
    setActionModalOpen(true);
  };

  const handleActionModalEdit = async () => {
    setActionModalOpen(false);
    if (!selectedFormula) return;

    if (selectedFormula.esProtegida) {
      setProtectedModalOpen(true);
      return;
    }

    try {
      // Obtener la fórmula completa con sus insumos antes de abrir el modal de edición
      const formulaCompleta = await FormulaService.getFormulaById(selectedFormula.id);
      setSelectedFormula(formulaCompleta);
      
      const status = await FormulaService.checkFormulaProtection(selectedFormula.id);
      if (!status.canEdit) {
        setProtectedModalOpen(true);
        return;
      }
      setIsCopyMode(false);
      setFormModalOpen(true);
    } catch (error: unknown) {
      console.error('Error checking formula protection:', error);
      showNotification('error', getErrorMessage(error) || 'Error al verificar el estado de la fórmula');
    }
  };

  const handleActionModalDelete = () => {
    setActionModalOpen(false);
    setDeleteModalOpen(true);
  };

  const handleCreateCopy = async () => {
    setProtectedModalOpen(false);
    if (!selectedFormula) return;

    try {
      // Obtener la fórmula completa con sus insumos
      const formulaCompleta = await FormulaService.getFormulaById(selectedFormula.id);
      
      // Generar un nombre único para la copia (más legible)
      const baseName = formulaCompleta.nombre;
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 16).replace(/[-:T]/g, '');
      const copyName = `${baseName}Copia_${dateStr}`;
      
      console.log('Preparando copia:', { baseName, copyName });
      
      // Establecer la fórmula como seleccionada para el modal con el nuevo nombre
      setSelectedFormula({ ...formulaCompleta, nombre: copyName, esProtegida: false });
      setIsCopyMode(true);
      setFormModalOpen(true);
    } catch (error: unknown) {
      console.error('Error loading complete formula for copy:', error);
      showNotification('error', 'Error al cargar la fórmula completa');
    }
  };

  const handleFormSubmit = async (formulaData: CreateFormulaRequest) => {
    console.log('handleFormSubmit iniciado:', { formulaData, isCopyMode, selectedFormula });
    setIsFormLoading(true);
    
    let operationSuccessful = false;
    
    try {
      if (selectedFormula && !isCopyMode) {
        // Editar fórmula existente
        console.log('Editando fórmula existente:', selectedFormula.id);
        await FormulaService.updateFormula(selectedFormula.id, {
          ...formulaData,
          id: selectedFormula.id,
        });
        showNotification('success', 'Fórmula actualizada correctamente');
        operationSuccessful = true;
      } else {
        // Crear nueva fórmula o copia
        console.log('Creando nueva fórmula o copia:', { isCopyMode });
        await FormulaService.createFormula(formulaData);
        const message = isCopyMode 
          ? 'Copia de fórmula creada correctamente' 
          : 'Fórmula creada correctamente';
        showNotification('success', message);
        operationSuccessful = true;
      }
      
    } catch (error: unknown) {
      console.error('Error saving formula:', error);
      
      // Verificar si la fórmula se creó a pesar del error de validación
      try {
        console.log('Verificando si la fórmula se creó a pesar del error...');
        const formulas = await FormulaService.getAllFormulas();
        const formulaCreada = formulas.find(f => f.nombre === formulaData.nombre);
        
        if (formulaCreada) {
          console.log('La fórmula se creó exitosamente a pesar del error de validación');
          const message = isCopyMode 
            ? 'Copia de fórmula creada correctamente' 
            : 'Fórmula creada correctamente';
          showNotification('success', message);
          operationSuccessful = true;
        } else {
          throw error; // Re-lanzar el error original si la fórmula no se creó
        }
      } catch (verificationError) {
        console.error('Error al verificar la creación de la fórmula:', verificationError);
        showNotification('error', getErrorMessage(error) || 'Error al guardar la fórmula');
      }
    } finally {
      setIsFormLoading(false);
      
      if (operationSuccessful) {
        console.log('Operación exitosa, cerrando modal y recargando lista...');
        
        // Cerrar modal y limpiar estado
        setFormModalOpen(false);
        setSelectedFormula(null);
        setIsCopyMode(false);
        
        // Recargar la lista para mostrar los cambios
        try {
          await loadFormulas();
          console.log('Lista de fórmulas recargada exitosamente');
        } catch (loadError) {
          console.error('Error al recargar la lista:', loadError);
          // Aún así mantenemos el modal cerrado
        }
      }
      
      console.log('handleFormSubmit finalizado');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFormula) return;
    setIsDeleteLoading(true);
    try {
      await FormulaService.deleteFormula(selectedFormula.id);
      showNotification('success', 'Fórmula eliminada correctamente');
      setDeleteModalOpen(false);
      setSelectedFormula(null);
      await loadFormulas();
    } catch (error: unknown) {
      console.error('Error deleting formula:', error);
      showNotification('error', getErrorMessage(error) || 'Error al eliminar la fórmula');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const closeAllModals = async () => {
    console.log('closeAllModals ejecutándose...');
    setFormModalOpen(false);
    setActionModalOpen(false);
    setProtectedModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedFormula(null);
    setIsCopyMode(false);
    
    console.log('Recargando lista desde closeAllModals...');
    // Recargar la lista para asegurar que se muestren los cambios
    await loadFormulas();
    console.log('Lista recargada desde closeAllModals');
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3e3529]">Fórmulas</h1>
          <p className="text-gray-600 mt-2 font-roboto">
            Gestiona las fórmulas nutricionales de la fábrica
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedFormula(null);
            setIsCopyMode(false);
            setFormModalOpen(true);
          }}
          className="bg-[#7c6a55] text-white px-4 py-2 rounded-md hover:bg-[#6b5847] 
                     focus:outline-none focus:ring-2 focus:ring-[#7c6a55] focus:ring-offset-2 
                     font-roboto font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Agregar Fórmula</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mb-4 p-4 rounded-md ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-roboto">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setNotification(null)}
                className="inline-flex text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Buscar fórmulas por nombre..." />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c6a55]" />
        </div>
      ) : (
        <FormulasTable formulas={filteredFormulas} onFormulaAction={handleFormulaAction} />
      )}

      {/* Help */}
      <div className="mt-6 p-4 bg-[#f3efe6] rounded-lg border-l-4 border-[#7c6a55]">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-[#7c6a55]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-[#3e3529] font-roboto">
              <strong>Tip:</strong> Usa el botón de tres puntos en cada fila para editar o eliminar
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FormulaFormModalSimple
        isOpen={formModalOpen}
        onClose={closeAllModals}
        onSubmit={handleFormSubmit}
        formula={selectedFormula}
        isLoading={isFormLoading}
        isCopyMode={isCopyMode}
      />

      <FormulaActionModal
        isOpen={actionModalOpen}
        onClose={closeAllModals}
        onEdit={handleActionModalEdit}
        onDelete={handleActionModalDelete}
        formula={selectedFormula}
      />

      <ProtectedFormulaModal
        isOpen={protectedModalOpen}
        onClose={closeAllModals}
        onCreateCopy={handleCreateCopy}
        formula={selectedFormula}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeAllModals}
        onConfirm={handleDeleteConfirm}
        formula={selectedFormula}
        isLoading={isDeleteLoading}
      />
    </div>
  );
};
