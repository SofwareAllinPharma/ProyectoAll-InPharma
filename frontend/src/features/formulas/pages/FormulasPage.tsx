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
import { useToast } from '../../../components/ui';

const getErrorMessage = (e: unknown) =>
  e instanceof Error ? e.message : typeof e === 'string' ? e : 'Ocurrió un error inesperado';

const PageContent: React.FC = () => {
  const { show, toasts, hide } = useToast() as any;
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [filteredFormulas, setFilteredFormulas] = useState<Formula[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [protectedModalOpen, setProtectedModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isCopyMode, setIsCopyMode] = useState(false);

  // notifications handled via useToast()

  const loadFormulas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await FormulaService.getAllFormulas();
      console.log('[FormulasPage] loadFormulas fetched', data.length);
      setFormulas(data);
      setFilteredFormulas(data);
    } catch (error: unknown) {
      console.error('Error loading formulas:', error);
      show({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFormulas();
  }, [loadFormulas]);

  const handleSearch = (q: string) => {
    console.log('[FormulasPage] search', q);
    setSearchQuery(q);
    const term = q.trim().toLowerCase();
    if (!term) return setFilteredFormulas(formulas);
    setFilteredFormulas(formulas.filter((f) => f.nombre.toLowerCase().includes(term)));
  };

  // ensure filtered list resets to formulas when formulas load and there's no active search
  useEffect(() => {
    if (!searchQuery) setFilteredFormulas(formulas);
  }, [formulas, searchQuery]);

  // Fallback: if formulas are present but filteredFormulas is unexpectedly empty, sync them (race guard)
  useEffect(() => {
    if (!searchQuery && formulas.length > 0 && filteredFormulas.length === 0) {
      console.warn('[FormulasPage] fallback sync filteredFormulas from formulas');
      setFilteredFormulas(formulas);
    }
  }, [formulas, filteredFormulas, searchQuery]);

  const handleEditFormula = (f: Formula) => {
    setSelectedFormula(f);
    setIsCopyMode(false);
    // If formula is protected, show the protected modal first
    if (f.esProtegida) {
      setProtectedModalOpen(true);
    } else {
      setFormModalOpen(true);
    }
  };

  const handleDeleteFormula = (f: Formula) => {
    setSelectedFormula(f);
    setDeleteModalOpen(true);
  };

  // Action modal removed: the table's ActionMenu calls onEdit/onDelete directly

  const handleCreateCopy = (f?: Formula) => {
    console.log('[FormulasPage] handleCreateCopy base:', f ?? selectedFormula);
    // If a formula is passed, use it; otherwise keep the currently selected formula
    const base = f ?? selectedFormula;
    if (!base) return;

    // count existing copies with the base name
    const baseName = base.nombre;
    // const regex = new RegExp('^' + baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 'Copia(_| )?(?:|\\d+)$', 'i');
    let maxIndex = 0;
    for (const existing of formulas) {
      if (existing.nombre.startsWith(baseName) && existing.nombre.includes('Copia')) {
        // try to extract trailing number
        const parts = existing.nombre.replace(baseName, '').replace(/[^0-9]/g, ' ').trim().split(/\s+/).filter(Boolean);
        const n = parts.length ? parseInt(parts[parts.length - 1], 10) : NaN;
        if (!Number.isNaN(n) && n > maxIndex) maxIndex = n;
        else if (Number.isNaN(n)) maxIndex = Math.max(maxIndex, 1);
      }
    }
    const next = maxIndex + 1;
    const copyName = `${baseName}Copia_${next}`;

    setSelectedFormula({ ...base, nombre: copyName });
    console.log('[FormulasPage] creating copy name:', copyName);
    setIsCopyMode(true);
    setProtectedModalOpen(false);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (formulaData: CreateFormulaRequest) => {
    console.log('[FormulasPage] submit payload:', formulaData, 'isCopyMode', isCopyMode, 'selectedFormula', selectedFormula);
    setIsFormLoading(true);
    try {
      if (isCopyMode) {
        // creating a copy: ensure we don't send an id and always create a new formula
        const payload = { ...(formulaData as any) };
        delete payload.id;
        await FormulaService.createFormula(payload);
        show({ message: 'Copia de fórmula creada correctamente', type: 'success' });
      } else if (selectedFormula && selectedFormula.id) {
        await FormulaService.updateFormula(selectedFormula.id, { ...formulaData, id: selectedFormula.id });
        show({ message: 'Fórmula actualizada correctamente', type: 'success' });
      } else {
        await FormulaService.createFormula(formulaData);
        show({ message: 'Fórmula creada correctamente', type: 'success' });
      }

      setFormModalOpen(false);
      setSelectedFormula(null);
      setIsCopyMode(false);
      await loadFormulas();
    } catch (error: unknown) {
      console.error('Error saving formula:', error);
      show({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFormula) return;
    setIsDeleteLoading(true);
    try {
      await FormulaService.deleteFormula(selectedFormula.id);
      show({ message: 'Fórmula eliminada correctamente', type: 'success' });
      setDeleteModalOpen(false);
      setSelectedFormula(null);
      await loadFormulas();
    } catch (error: unknown) {
      console.error('Error deleting formula:', error);
      show({ message: getErrorMessage(error) || 'Error al eliminar la fórmula', type: 'error' });
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
          {/* Toasts area: render toasts above the search bar */}
          {toasts && toasts.length > 0 && (
            <div className="mb-4">
              {toasts.map((t: any) => (
                <div key={t.id} className="mb-3">
                  {/* Reuse Toast component by rendering via provider -- but we don't import Toast here to avoid duplication */}
                  <div className="max-w-full">
                    <div className="p-0">
                      {/* Recreate the same markup used by Toast to ensure consistent look */}
                      <div className={`w-full rounded-md ${t.type !== 'custom' ? (t.type === 'success' ? 'bg-green-50' : t.type === 'error' ? 'bg-red-50' : t.type === 'info' ? 'bg-blue-50' : 'bg-yellow-50') : ''} border border-green-200`}>
                        <div className="p-4 flex items-start gap-3">
                          <div className="flex-1 text-green-800">{t.message}</div>
                          <div>
                            <button onClick={() => hide(t.id)} className="text-gray-400 hover:text-gray-600">×</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

export default function FormulasPage() {
  return <PageContent />;
}
