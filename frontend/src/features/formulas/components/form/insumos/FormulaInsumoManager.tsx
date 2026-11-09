import React, { useEffect, useRef, useState } from 'react';
import type { Insumo } from '../../../../insumos/types/insumo.types';
import type { FormulaInsumo } from '../../../types/formula.types';
import type { Formula } from '../../../types/formula.types';
import { InsumoService } from '../../../../insumos/services/insumo.service';
import { FormulaService } from '../../../services/formula.service';
import FormulaInsumoRow from './FormulaInsumoRow';
import FormulaInsumoHeader from './FormulaInsumoHeader';
import FormulaInsumoEmpty from './FormulaInsumoEmpty';
import FormulaInsumoSummary from './FormulaInsumoSummary';
import SearchSelect from '../../../../../components/ui/SearchSelect';

interface Props { formulaInsumos: FormulaInsumo[]; onChange: (ins: FormulaInsumo[], touched?: boolean) => void; disabled?: boolean }

export const FormulaInsumoManager: React.FC<Props> = ({ formulaInsumos, onChange, disabled }) => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);
  const firstRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | undefined>();
  const [touched, setTouched] = useState<Record<number, boolean>>({});
  const [lastIdx, setLastIdx] = useState<number | null>(null);

  // Import formula state
  const [importOpen, setImportOpen] = useState(false);
  const [allFormulas, setAllFormulas] = useState<Formula[]>([]);
  const [importSelected, setImportSelected] = useState<Formula | null>(null);
  const [formulsLoading, setFormulasLoading] = useState(false);

  useEffect(() => { void (async () => { setLoading(true); try { setInsumos(await InsumoService.getAllInsumos()); } catch { /* ignore */ } finally { setLoading(false); } })(); }, []);

  useEffect(() => {
    const calc = () => {
      const el = firstRef.current; if (!el) return setHeight(undefined);
      const row = el.clientHeight;
      const gap = 12;
      const visible = 4;
      if ((formulaInsumos?.length || 0) <= visible) return setHeight(undefined);
      // if measurement is 0 (not yet rendered), retry on next frame
      if (row === 0) {
        requestAnimationFrame(() => {
          const r = firstRef.current?.clientHeight || 0;
          if (r > 0) setHeight(Math.max(0, Math.round(r * visible + gap * (visible - 1))));
        });
        return;
      }
      setHeight(Math.max(0, Math.round(row * visible + gap * (visible - 1))));
    };
    calc(); window.addEventListener('resize', calc); return () => window.removeEventListener('resize', calc);
  }, [formulaInsumos.length]);

  const baseRow = () => ({ idFormula: 0, idInsumo: 0, cantidadInsumo: 0 } as FormulaInsumo);
  const add = () => { const i = formulaInsumos.length; onChange([...formulaInsumos, baseRow()]); setLastIdx(i); };
  const upd = (idx: number, f: keyof FormulaInsumo, v: number, markTouched = false) => {
    const copy = [...formulaInsumos]; copy[idx] = { ...copy[idx], [f]: v };
    if (f === 'idInsumo') copy[idx].insumo = insumos.find(x => x.id === v);
    if (markTouched) {
      setTouched(s => ({ ...s, [idx]: true }));
      onChange(copy, true);
    } else {
      onChange(copy, Object.keys(touched).length > 0);
    }
  };
  const remove = (idx: number) => onChange(formulaInsumos.filter((_, i) => i !== idx), Object.keys(touched).length > 0);
  const rowBlur = (idx: number) => {
    setLastIdx(null);
    setTouched(prev => {
      const already = Boolean(prev[idx]);
      const next = { ...prev, [idx]: true };
      if (!already) {
        onChange(formulaInsumos, true);
      }
      return next;
    });
  };

  const openImport = async () => {
    setImportOpen(true);
    setImportSelected(null);
    if (allFormulas.length === 0) {
      setFormulasLoading(true);
      try { setAllFormulas(await FormulaService.getAllFormulas()); } catch { /* ignore */ } finally { setFormulasLoading(false); }
    }
  };

  const confirmImport = () => {
    if (!importSelected?.insumos?.length) return;
    const currentIds = new Set(formulaInsumos.map(f => f.idInsumo).filter(id => id > 0));
    const toAdd: FormulaInsumo[] = importSelected.insumos
      .filter(fi => !currentIds.has(fi.idInsumo))
      .map(fi => ({
        idFormula: 0,
        idInsumo: fi.idInsumo,
        cantidadInsumo: fi.cantidadInsumo,
        insumo: insumos.find(i => i.id === fi.idInsumo),
      } as FormulaInsumo));
    onChange([...formulaInsumos, ...toAdd], Object.keys(touched).length > 0);
    setImportOpen(false);
    setImportSelected(null);
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c6a55]" /></div>;

  return (
    <div className="space-y-4">
      <FormulaInsumoHeader onAdd={add} onImport={openImport} disabled={disabled} />

      {/* Import formula panel */}
      {importOpen && (
        <div className="border border-[#7c6a55]/40 rounded-lg p-4 bg-[#f9f5f0] space-y-3">
          <p className="text-sm font-medium text-gray-700">Seleccionar fórmula a importar:</p>
          {formulsLoading ? (
            <div className="flex justify-center py-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#7c6a55]" /></div>
          ) : (
            <SearchSelect<Formula>
              items={allFormulas}
              value={importSelected}
              getKey={(f) => f.id}
              getLabel={(f) => f.nombre}
              onSelect={(f) => setImportSelected(f)}
              placeholder="Buscar fórmula..."
            />
          )}
          {importSelected && (
            <p className="text-xs text-gray-500">
              {importSelected.insumos?.length || 0} insumos — solo se agregarán los que no estén ya en la lista.
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmImport}
              disabled={!importSelected}
              className="text-sm px-3 py-1 bg-[#7c6a55] text-white rounded-md hover:bg-[#6b5847] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Importar insumos
            </button>
          </div>
        </div>
      )}

      {formulaInsumos.length === 0 ? <FormulaInsumoEmpty /> : (
        <div className={height ? 'overflow-auto' : undefined} style={height ? { maxHeight: `${height}px` } : undefined}>
          <div className="space-y-3">
            {formulaInsumos.map((fi, idx) => {
              const show = Boolean(touched[idx]);
              const errs: string[] = [];
              if (show) { if (!fi.idInsumo) errs.push('Seleccione un insumo'); if (!fi.cantidadInsumo || fi.cantidadInsumo <= 0) errs.push('La cantidad debe ser mayor a 0'); }

              const selectedIds = new Set(formulaInsumos.map(f => f.idInsumo).filter(id => id > 0));
              const rowAvailableInsumos = insumos.filter(i => !selectedIds.has(i.id) || i.id === fi.idInsumo);

              return (
                <div key={idx} ref={idx === 0 ? firstRef : undefined}>
                  <FormulaInsumoRow index={idx} formulaInsumo={fi} availableInsumos={rowAvailableInsumos} onUpdate={upd} onRemove={remove} disabled={disabled} rowErrors={errs} autoFocus={lastIdx === idx} onRowBlur={rowBlur} />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {formulaInsumos.length > 0 && <FormulaInsumoSummary formulaInsumos={formulaInsumos} />}
    </div>
  );
};