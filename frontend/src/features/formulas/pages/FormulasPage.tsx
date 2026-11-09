import React, { useState, useEffect, useRef } from 'react';
import PageShell from '../../../components/PageShell';
import SearchBar from '../components/SearchBar';
import { FormulasTable } from '../components/FormulasTable';
import { FormulaFormModal } from '../components/form/FormulaFormModal';
import { ProtectedFormulaModal } from '../components/ProtectedFormulaModal';
import { DeleteConfirmModal } from '../components/form/DeleteConfirmModal';
import TipBox from '../../../components/ui/TipBox';
import { useToast } from '../../../components/ui/toast/ToastContext';
import { FormulaService } from '../services/formula.service';
import { InsumoService } from '../../insumos/services/insumo.service';
import type { Formula, CreateFormulaRequest } from '../types/formula.types';
import type { Insumo } from '../../insumos/types/insumo.types';
import { useAuth } from '../../../lib/auth';

const FormulasPage: React.FC = () => {
  const { show } = useToast() as any;
  const { isAdminSis, isAdminFab, isTecnico } = useAuth();
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const formulasRef = useRef<Formula[]>([]);
  const [filtered, setFiltered] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtro por insumo
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [selectedInsumo, setSelectedInsumo] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [protectedOpen, setProtectedOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Formula | null>(null);
  const [isCopy, setIsCopy] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const canEditProtected = isAdminSis || isAdminFab;
  const canCreateOrEdit = !isTecnico;

  const syncFormulas = (data: Formula[]) => { setFormulas(data); formulasRef.current = data; setFiltered(data); };

  const reloadFormulas = async (insumoId?: number | null) => {
    const idToUse = insumoId !== undefined ? insumoId : selectedInsumo;
    const data = await FormulaService.getAllFormulas(idToUse || undefined);
    syncFormulas(data);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [formulasData, insumosData] = await Promise.all([
          FormulaService.getAllFormulas(),
          InsumoService.getAllInsumos()
        ]);
        syncFormulas(formulasData);
        setInsumos(insumosData);
      } catch {
        show({ message: 'Error cargando datos', type: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (q = '') => {
    const term = q.trim().toLowerCase();
    const source = formulasRef.current || formulas;
    setFiltered(!term ? source : source.filter(f => f.nombre.toLowerCase().includes(term)));
  };

  const handleInsumoChange = async (id: number | null) => {
    setSelectedInsumo(id);
    setLoading(true);
    try {
      await reloadFormulas(id);
    } catch {
      show({ message: 'Error filtrando fórmulas', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { }, [filtered]);

  const openEdit = (f: Formula) => {
    if (!canCreateOrEdit) {
      show({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para editar fórmulas' });
      return;
    }
    if (f.esProtegida && !canEditProtected) {
      // Offer to create a copy instead of showing an error
      setSelected(f);
      setProtectedOpen(true);
      return;
    }
    setSelected(f);
    setIsCopy(false);
    setFormOpen(true);
  };
  const openDelete = (f: Formula) => {
    if (!canCreateOrEdit) {
      show({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para eliminar fórmulas' });
      return;
    }
    if (f.esProtegida && !canEditProtected) {
      show({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para eliminar fórmulas protegidas' });
      return;
    }
    setSelected(f); setDeleteOpen(true);
  };

  const createCopy = (base?: Formula) => { const b = base ?? selected; if (!b) return; const nameBase = b.nombre; let max = 0; for (const e of formulas) if (e.nombre.startsWith(nameBase) && e.nombre.includes('Copia')) { const n = parseInt(e.nombre.replace(nameBase, '').replace(/[^0-9]/g, ' ').trim().split(/\s+/).pop() || '', 10); if (!isNaN(n) && n > max) max = n; } setSelected({ ...b, nombre: `${nameBase}Copia_${max + 1}` } as Formula); setIsCopy(true); setProtectedOpen(false); setFormOpen(true); };

  const onSubmit = async (payload: CreateFormulaRequest) => {
    setFormLoading(true);
    try {
      if (isCopy) {
        const p = { ...(payload as any) };
        delete (p as any).id;
        await FormulaService.createFormula(p);
        show({ message: 'Copia de fórmula creada correctamente', type: 'success' });
      } else if (selected?.id) {
        await FormulaService.updateFormula(selected.id, { ...payload, id: selected.id });
        show({ message: 'Fórmula actualizada correctamente', type: 'success' });
      } else {
        await FormulaService.createFormula(payload);
        show({ message: 'Fórmula creada correctamente', type: 'success' });
      }
      setFormOpen(false); setSelected(null); setIsCopy(false); await reloadFormulas();
    } catch (e) {
      show({ message: 'Error guardando fórmula', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const onDelete = async () => {
    if (!selected) return;
    setFormLoading(true);
    try {
      await FormulaService.deleteFormula(selected.id);
      show({ message: 'Fórmula eliminada correctamente', type: 'success' });
      setDeleteOpen(false);
      setSelected(null);
      await reloadFormulas();
    } catch {
      show({ message: 'Error eliminando fórmula', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const closeAll = async () => {
    setFormOpen(false);
    setProtectedOpen(false);
    setDeleteOpen(false);
    setSelected(null);
    setIsCopy(false);
    await reloadFormulas();
  };

  return (
    <PageShell
      title="Fórmulas"
      subtitle="Gestiona las fórmulas nutricionales de la fábrica"
      onCreate={canCreateOrEdit ? () => { setSelected(null); setIsCopy(false); setFormOpen(true); } : undefined}
      createLabel="Agregar Fórmula"
      loading={loading}
      noContainer
      searchNode={(
        <>
          <div className="mb-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Buscar fórmulas por nombre..."
              insumos={insumos}
              selectedInsumo={selectedInsumo}
              onInsumoChange={handleInsumoChange}
            />
          </div>
        </>
      )}
      helpTip={(<TipBox><><strong>Tip:</strong> Usa el botón de tres puntos en cada fila para editar o eliminar</></TipBox>)}
      modals={(
        <>
          <FormulaFormModal isOpen={formOpen} onClose={closeAll} onSubmit={onSubmit} formula={selected} isLoading={formLoading} isCopyMode={isCopy} existingNames={formulas.map(f => f.nombre)} canEditProtected={canEditProtected} />
          <ProtectedFormulaModal isOpen={protectedOpen} onClose={closeAll} onCreateCopy={createCopy} formula={selected} />
          <DeleteConfirmModal isOpen={deleteOpen} onClose={closeAll} onConfirm={onDelete} formula={selected} isLoading={formLoading} />
        </>
      )}
    >
      {loading ? (
        <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c6a55]" /></div>
      ) : (
        <FormulasTable
          formulas={filtered}
          onEdit={openEdit}
          onDelete={openDelete}
          onCopy={canCreateOrEdit ? createCopy : undefined}
        />
      )}
    </PageShell>
  );
};

export default FormulasPage;
