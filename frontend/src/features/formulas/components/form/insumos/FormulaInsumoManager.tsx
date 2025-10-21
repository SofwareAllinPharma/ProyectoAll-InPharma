import React, { useEffect, useRef, useState } from 'react';
import type { Insumo } from '../../../../insumos/types/insumo.types';
import type { FormulaInsumo } from '../../../types/formula.types';
import { InsumoService } from '../../../../insumos/services/insumo.service';
import FormulaInsumoRow from './FormulaInsumoRow';
import FormulaInsumoHeader from './FormulaInsumoHeader';
import FormulaInsumoEmpty from './FormulaInsumoEmpty';
import FormulaInsumoSummary from './FormulaInsumoSummary';

interface Props { formulaInsumos: FormulaInsumo[]; onChange: (ins: FormulaInsumo[], touched?: boolean) => void; disabled?: boolean }

export const FormulaInsumoManager: React.FC<Props> = ({ formulaInsumos, onChange, disabled }) => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);
  const firstRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | undefined>();
  const [touched, setTouched] = useState<Record<number, boolean>>({});
  const [lastIdx, setLastIdx] = useState<number | null>(null);

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
  const upd = (idx: number, f: keyof FormulaInsumo, v: number) => {
    const copy = [...formulaInsumos]; copy[idx] = { ...copy[idx], [f]: v };
    if (f === 'idInsumo') copy[idx].insumo = insumos.find(x => x.id === v);
    onChange(copy, Object.keys(touched).length > 0);
  };
  const remove = (idx: number) => onChange(formulaInsumos.filter((_, i) => i !== idx), Object.keys(touched).length > 0);
  const rowBlur = (idx: number) => { setTouched(s => ({ ...s, [idx]: true })); setLastIdx(null); onChange(formulaInsumos, true); };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c6a55]"/></div>;

  return (
    <div className="space-y-4">
      <FormulaInsumoHeader onAdd={add} disabled={disabled} />
      {formulaInsumos.length === 0 ? <FormulaInsumoEmpty /> : (
        <div className={height ? 'overflow-auto' : undefined} style={height ? { maxHeight: `${height}px` } : undefined}>
          <div className="space-y-3">
            {formulaInsumos.map((fi, idx) => {
              const show = Boolean(touched[idx]);
              const errs: string[] = [];
              if (show) { if (!fi.idInsumo) errs.push('Seleccione un insumo'); if (!fi.cantidadInsumo || fi.cantidadInsumo <= 0) errs.push('La cantidad debe ser mayor a 0'); }
              return (
                <div key={idx} ref={idx === 0 ? firstRef : undefined}>
                  <FormulaInsumoRow index={idx} formulaInsumo={fi} availableInsumos={insumos} onUpdate={upd} onRemove={remove} disabled={disabled} rowErrors={errs} autoFocus={lastIdx === idx} onRowBlur={rowBlur} />
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