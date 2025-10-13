import React, { useState, useEffect, useCallback } from 'react';
import { FormulasTable } from '../components/FormulasTable';
import SearchBar from '../components/SearchBar';
import { FormulaFormModal } from '../components/form/FormulaFormModal';
import { ProtectedFormulaModal } from '../components/ProtectedFormulaModal';
import { DeleteConfirmModal } from '../components/form/DeleteConfirmModal';
import TipBox from '../../../components/ui/TipBox';
import PageShell from '../../../components/PageShell';
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
      showNotification('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFormulas();
  }, [loadFormulas]);

  const handleSearch = (q: string) => {
    const term = q.trim().toLowerCase();
    if (!term) return setFilteredFormulas(formulas);
    setFilteredFormulas(formulas.filter((f) => f.nombre.toLowerCase().includes(term)));
  };

  const handleEditFormula = (f: Formula) => {
    setSelectedFormula(f);
    setIsCopyMode(false);
    setFormModalOpen(true);
  };

  const handleDeleteFormula = (f: Formula) => {
    setSelectedFormula(f);
    setDeleteModalOpen(true);
  };

  // Action modal removed: the table's ActionMenu calls onEdit/onDelete directly

  const handleCreateCopy = (f?: Formula) => {
    setSelectedFormula(f ?? null);
    setIsCopyMode(true);
    setProtectedModalOpen(false);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (formulaData: CreateFormulaRequest) => {
    setIsFormLoading(true);
    try {
      if (selectedFormula && selectedFormula.id) {
        await FormulaService.updateFormula(selectedFormula.id, { ...formulaData, id: selectedFormula.id });
        showNotification('success', 'Fórmula actualizada correctamente');
      } else {
        await FormulaService.createFormula(formulaData);
        const message = isCopyMode ? 'Copia de fórmula creada correctamente' : 'Fórmula creada correctamente';
        showNotification('success', message);
      }

      setFormModalOpen(false);
      setSelectedFormula(null);
      setIsCopyMode(false);
      await loadFormulas();
    } catch (error: unknown) {
      console.error('Error saving formula:', error);
      showNotification('error', getErrorMessage(error));
    } finally {
      setIsFormLoading(false);
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
    setFormModalOpen(false);
    setProtectedModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedFormula(null);
    setIsCopyMode(false);
    await loadFormulas();
  };

  return (
    <PageShell
      title="Fórmulas"
      subtitle="Gestiona las fórmulas nutricionales de la fábrica"
      onCreate={() => {
        setSelectedFormula(null);
        setIsCopyMode(false);
        setFormModalOpen(true);
      }}
      createLabel="Agregar Fórmula"
      loading={loading}
  noContainer={true}
      searchNode={(
        <>
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

          <div className="mb-6">
            <SearchBar onSearch={handleSearch} placeholder="Buscar fórmulas por nombre..." />
          </div>
        </>
      )}
      helpTip={(
        <TipBox>
          <><strong>Tip:</strong> Usa el botón de tres puntos en cada fila para editar o eliminar</>
        </TipBox>
      )}
      modals={(
        <>
          <FormulaFormModal
            isOpen={formModalOpen}
            onClose={closeAllModals}
            onSubmit={handleFormSubmit}
            formula={selectedFormula}
            isLoading={isFormLoading}
            isCopyMode={isCopyMode}
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
        </>
      )}
    >
      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c6a55]" />
        </div>
      ) : (
        <FormulasTable formulas={filteredFormulas} onEdit={handleEditFormula} onDelete={handleDeleteFormula} />
      )}

      {/* helpTip is provided via PageShell props; do not render a duplicate TipBox here */}
    </PageShell>
  );
};
