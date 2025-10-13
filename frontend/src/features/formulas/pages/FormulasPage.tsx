import React, { useState, useEffect } from 'react';
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

const FormulasPage: React.FC = () => {
  const { show, toasts, hide } = useToast() as any;
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const formulasRef = React.useRef<Formula[]>([]);
  const [filtered, setFiltered] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(false);
  const instanceIdRef = React.useRef<string>(Math.random().toString(36).slice(2, 8));

  const [formOpen, setFormOpen] = useState(false);
  const [protectedOpen, setProtectedOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Formula | null>(null);
  const [isCopy, setIsCopy] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const data = await FormulaService.getAllFormulas();
        // DEBUG
  // eslint-disable-next-line no-console
        console.log('[FormulasPage:%s] fetched formulas count', instanceIdRef.current, Array.isArray(data) ? data.length : 'not-array');
  setFormulas(data);
  formulasRef.current = data;
  setFiltered(data);
      } catch {
        show({ message: 'Error cargando fórmulas', type: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (q = '') => {
    const term = q.trim().toLowerCase();
    // eslint-disable-next-line no-console
    console.log('[FormulasPage:%s] handleSearch called with:', instanceIdRef.current, JSON.stringify(term));
    const source = formulasRef.current || formulas;
    setFiltered(!term ? source : source.filter(f => f.nombre.toLowerCase().includes(term)));
  };

  // DEBUG: log whenever filtered changes (keep outside JSX to avoid returning void)
  React.useEffect(() => {
  // eslint-disable-next-line no-console
  console.log('[FormulasPage] filtered length', Array.isArray(filtered) ? filtered.length : 'not-array');
  }, [filtered]);

  const openEdit = (f: Formula) => {
    setSelected(f);
    setIsCopy(false);
    f.esProtegida ? setProtectedOpen(true) : setFormOpen(true);
  };
  const openDelete = (f: Formula) => { setSelected(f); setDeleteOpen(true); };

  const createCopy = (base?: Formula) => {
    const b = base ?? selected;
    if (!b) return;
    const nameBase = b.nombre;
    let max = 0;
    for (const e of formulas)
      if (e.nombre.startsWith(nameBase) && e.nombre.includes('Copia')) {
        const n = parseInt(e.nombre.replace(nameBase, '').replace(/[^0-9]/g, ' ').trim().split(/\s+/).pop() || '', 10);
        if (!isNaN(n) && n > max) max = n;
      }
    const copyName = `${nameBase}Copia_${max + 1}`;
    setSelected({ ...b, nombre: copyName } as Formula);
    setIsCopy(true);
    setProtectedOpen(false);
    setFormOpen(true);
  };

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
      setFormOpen(false); setSelected(null); setIsCopy(false);
      const data = await FormulaService.getAllFormulas();
  setFormulas(data); formulasRef.current = data; setFiltered(data);
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
      const data = await FormulaService.getAllFormulas();
      setFormulas(data);
      formulasRef.current = data;
      setFiltered(data);
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
    const data = await FormulaService.getAllFormulas();
    setFormulas(data);
    formulasRef.current = data;
    setFiltered(data);
  };

  return (
    <PageShell title="Fórmulas" subtitle="Gestiona las fórmulas nutricionales de la fábrica" onCreate={() => { setSelected(null); setIsCopy(false); setFormOpen(true); }} createLabel="Agregar Fórmula" loading={loading} noContainer searchNode={(
      <>
  {/* debug badge removed */}
        {toasts && toasts.length > 0 && (
          <div className="mb-4">{toasts.map((t: any) => <div key={t.id} className="mb-3"><div className={`w-full rounded-md ${t.type==='success'?'bg-green-50':'bg-blue-50'} border border-green-200`}><div className="p-4 flex items-start gap-3"><div className="flex-1 text-green-800">{t.message}</div><div><button onClick={() => hide(t.id)} className="text-gray-400">×</button></div></div></div></div>)}</div>
        )}
        <div className="mb-6"><SearchBar onSearch={handleSearch} placeholder="Buscar fórmulas por nombre..." /></div>
      </>
    )} helpTip={(<TipBox><><strong>Tip:</strong> Usa el botón de tres puntos en cada fila para editar o eliminar</></TipBox>)} modals={(<><FormulaFormModal isOpen={formOpen} onClose={closeAll} onSubmit={onSubmit} formula={selected} isLoading={formLoading} isCopyMode={isCopy} /><ProtectedFormulaModal isOpen={protectedOpen} onClose={closeAll} onCreateCopy={createCopy} formula={selected} /><DeleteConfirmModal isOpen={deleteOpen} onClose={closeAll} onConfirm={onDelete} formula={selected} isLoading={formLoading} /></>)}>
      {loading ? <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c6a55]" /></div> : <FormulasTable formulas={filtered} onEdit={openEdit} onDelete={openDelete} />}
    </PageShell>
  );
};

export default FormulasPage;

