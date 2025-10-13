import React, { useState, useEffect } from 'react';
import type { Insumo } from '../../../../insumos/types/insumo.types';
import type { FormulaInsumo } from '../../../types/formula.types';
import { InsumoService } from '../../../../insumos/services/insumo.service';

import FormulaInsumoRow from './FormulaInsumoRow';
import FormulaInsumoHeader from './FormulaInsumoHeader';
import FormulaInsumoEmpty from './FormulaInsumoEmpty';
import FormulaInsumoSummary from './FormulaInsumoSummary';

interface FormulaInsumoManagerProps {
  formulaInsumos: FormulaInsumo[];
  onChange: (insumos: FormulaInsumo[]) => void;
  disabled?: boolean;
}

export const FormulaInsumoManager: React.FC<FormulaInsumoManagerProps> = ({ formulaInsumos, onChange, disabled = false }) => {
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
    const updated = [...formulaInsumos];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'idInsumo') {
      const sel = availableInsumos.find(i => i.id === value);
      if (sel) updated[index].insumo = sel;
    }
    onChange(updated);
  };

  const removeInsumo = (index: number) => onChange(formulaInsumos.filter((_, i) => i !== index));

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
            <FormulaInsumoRow
              key={idx}
              index={idx}
              formulaInsumo={fi}
              availableInsumos={availableInsumos}
              onUpdate={updateInsumo}
              onRemove={removeInsumo}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {formulaInsumos.length > 0 && <FormulaInsumoSummary formulaInsumos={formulaInsumos} />}
    </div>
  );
};