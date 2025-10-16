import React, { useState, useEffect } from 'react';
import type { Insumo } from '../../../../insumos/types/insumo.types';
import type { FormulaInsumo } from '../../../types/formula.types';
import { InsumoService } from '../../../../insumos/services/insumo.service';

import FormulaInsumoRow from './FormulaInsumoRow';
import FormulaInsumoHeader from './FormulaInsumoHeader';
import FormulaInsumoEmpty from './FormulaInsumoEmpty';
import FormulaInsumoSummary from './FormulaInsumoSummary';

interface RowErrors { idInsumo?: string; cantidadInsumo?: string; duplicate?: string }

interface FormulaInsumoManagerProps {
  formulaInsumos: FormulaInsumo[];
  onChange: (insumos: FormulaInsumo[]) => void;
  disabled?: boolean;
  rowErrors?: Record<number, RowErrors>;
  onValidateRow?: (index: number) => void;
  onTouchRow?: (index: number) => void;
  onSetRowError?: (index: number, err: RowErrors) => void;
  onRowRemoved?: (index: number) => void;
  totalPeso?: number;
}

export const FormulaInsumoManager: React.FC<FormulaInsumoManagerProps> = ({ formulaInsumos, onChange, disabled = false, rowErrors, onValidateRow, onTouchRow, onSetRowError, onRowRemoved, totalPeso }) => {
  const [availableInsumos, setAvailableInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const ins = await InsumoService.getAllInsumos();
        setAvailableInsumos(ins);
      } catch (err) {
        console.error('Error loading insumos:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addInsumo = () => onChange([...formulaInsumos, { idFormula: 0, idInsumo: 0, cantidadInsumo: 0 }]);

  const updateInsumo = (index: number, field: keyof FormulaInsumo, value: number) => {
    // mark row as touched
    onTouchRow?.(index);

    // When selecting idInsumo, block duplicates
    if (field === 'idInsumo') {
      const already = formulaInsumos.some((f, i) => f.idInsumo === value && i !== index && value !== 0);
      if (already) {
        onSetRowError?.(index, { duplicate: 'Este insumo ya fue agregado' });
        return;
      }
    }

    const updated = [...formulaInsumos];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'idInsumo') {
      const sel = availableInsumos.find(i => i.id === value);
      if (sel) updated[index].insumo = sel; else delete updated[index].insumo;
    }
    onChange(updated);

    // request parent to revalidate this row
    onValidateRow?.(index);
  };

  const removeInsumo = (index: number) => {
    onChange(formulaInsumos.filter((_, i) => i !== index));
    onRowRemoved?.(index);
  };

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c6a55]" />
    </div>
  );

  return (
    <div className="space-y-4">
      <FormulaInsumoHeader onAdd={addInsumo} disabled={disabled} />

      {formulaInsumos.length === 0 ? (
        <FormulaInsumoEmpty />
      ) : (
        <div className="space-y-3">
          {formulaInsumos.map((fi, idx) => (
            <div key={idx} className="space-y-1">
              <FormulaInsumoRow
                index={idx}
                formulaInsumo={fi}
                availableInsumos={availableInsumos}
                onUpdate={(i, field, val) => updateInsumo(i, field, val)}
                onRemove={(i) => removeInsumo(i)}
                disabled={disabled}
              />
              <div className="px-3">
                {rowErrors?.[idx]?.idInsumo && <p className="mt-1 text-xs text-red-600">{rowErrors[idx].idInsumo}</p>}
                {rowErrors?.[idx]?.cantidadInsumo && <p className="mt-1 text-xs text-red-600">{rowErrors[idx].cantidadInsumo}</p>}
                {rowErrors?.[idx]?.duplicate && <p className="mt-1 text-xs text-red-600">{rowErrors[idx].duplicate}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {formulaInsumos.length > 0 && <FormulaInsumoSummary formulaInsumos={formulaInsumos} totalPeso={totalPeso} />}
    </div>
  );
};