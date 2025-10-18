import React, { useState, useEffect, useRef } from 'react';
import PageShell from '../../../components/PageShell';
import SearchBar from '../components/SearchBar';
import { FormulasTable } from '../components/FormulasTable';
import { FormulaFormModal } from '../components/form/FormulaFormModal';
import { ProtectedFormulaModal } from '../components/ProtectedFormulaModal';
import { DeleteConfirmModal } from '../components/form/DeleteConfirmModal';
import TipBox from '../../../components/ui/TipBox';
import { useToast } from '../../../components/ui';
import { FormulaService } from '../services/formula.service';
import type { Formula, CreateFormulaRequest } from '../types/formula.types';
import FormulaViewModal from '../components/FormulaViewModal';

const FormulasPage: React.FC = () => {
  const { show, toasts, hide } = useToast() as any;
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const formulasRef = useRef<Formula[]>([]);
  const [filtered, setFiltered] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [protectedOpen, setProtectedOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Formula | null>(null);
  const [isCopy, setIsCopy] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const syncFormulas = (data: Formula[]) => { setFormulas(data); formulasRef.current = data; setFiltered(data); };
  const reloadFormulas = async () => { const data = await FormulaService.getAllFormulas(); syncFormulas(data); };
  useEffect(() => { (async () => { setLoading(true); try { await reloadFormulas(); } catch { show({ message: 'Error cargando fórmulas', type: 'error' }); } finally { setLoading(false); } })(); }, []);

const handleSearch = (q?: string) => {
  const term = (q ?? '').toString().trim().toLowerCase();
  const source = formulasRef.current?.length ? formulasRef.current : formulas;

  const filteredList = !term
    ? source
    : source.filter(f => (f?.nombre ?? '').toString().toLowerCase().includes(term));

  setFiltered(filteredList);
};
  useEffect(() => {}, [filtered]);

  const openEdit = (f: Formula) => {
    setViewOpen(false); // Cerrar modal de consultar si está abierto
    setDeleteOpen(false); // Cerrar modal de eliminar si está abierto
    setSelected(f);
    setIsCopy(false);
    if (f.esProtegida) {
      setProtectedOpen(true);
    } else {
      setFormOpen(true);
    }
  };
  const openView = (f: Formula) => { 
    setFormOpen(false); // Cerrar modal de formulario si está abierto
    setProtectedOpen(false); // Cerrar modal de protegida si está abierto
    setDeleteOpen(false); // Cerrar modal de eliminar si está abierto
    setSelected(f); 
    setViewOpen(true); 
  };
  const openDelete = (f: Formula) => { 
    setViewOpen(false); // Cerrar modal de consultar si está abierto
    setFormOpen(false); // Cerrar modal de formulario si está abierto
    setProtectedOpen(false); // Cerrar modal de protegida si está abierto
    setSelected(f); 
    setDeleteOpen(true); 
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
    <PageShell title="Fórmulas" subtitle="Gestiona las fórmulas nutricionales de la fábrica" onCreate={() => { setSelected(null); setIsCopy(false); setFormOpen(true); }} createLabel="Agregar Fórmula" loading={loading} noContainer searchNode={(
      <>
        {toasts && toasts.length > 0 && (
          <div className="mb-4">{toasts.map((t: any) => <div key={t.id} className="mb-3"><div className={`w-full rounded-md ${t.type==='success'?'bg-green-50':'bg-blue-50'} border border-green-200`}><div className="p-4 flex items-start gap-3"><div className="flex-1 text-green-800">{t.message}</div><div><button onClick={() => hide(t.id)} className="text-gray-400">×</button></div></div></div></div>)}</div>
        )}
        <div className="mb-6"><SearchBar onSearch={handleSearch} placeholder="Buscar fórmulas por nombre..." /></div>
      </>
    )} helpTip={(<TipBox><><strong>Tip:</strong> Usa el botón de tres puntos en cada fila para editar o eliminar</></TipBox>)} modals={(<>
      <FormulaFormModal isOpen={formOpen} onClose={closeAll} onSubmit={onSubmit} formula={selected} isLoading={formLoading} isCopyMode={isCopy} />
      <ProtectedFormulaModal isOpen={protectedOpen} onClose={closeAll} onCreateCopy={createCopy} formula={selected} />
      <DeleteConfirmModal isOpen={deleteOpen} onClose={closeAll} onConfirm={onDelete} formula={selected} isLoading={formLoading} />
      <FormulaViewModal isOpen={viewOpen} onClose={closeAll} formula={selected} />
    </>)}>
      {loading ? <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c6a55]" /></div> : <FormulasTable formulas={filtered} onEdit={openEdit} onDelete={openDelete} onView={openView} />}
    </PageShell>
  );
};

export default FormulasPage;

