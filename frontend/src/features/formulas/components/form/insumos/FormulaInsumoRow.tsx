import type { Insumo } from '../../../../insumos/types/insumo.types';
import type { FormulaInsumo } from '../../../types/formula.types';
import { useEffect, useState, useRef } from 'react';
import SearchSelect from '../../../../../components/ui/SearchSelect';

interface Props {
  index: number;
  formulaInsumo: FormulaInsumo;
  availableInsumos: Insumo[];
  onUpdate: (index: number, field: keyof FormulaInsumo, value: number, markTouched?: boolean) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
  rowErrors?: string[];
  autoFocus?: boolean;
  onRowBlur?: (index: number) => void;
}

export default function FormulaInsumoRow({ index, formulaInsumo, availableInsumos, onUpdate, onRemove, disabled = false, rowErrors = [], autoFocus = false, onRowBlur }: Props) {
  const [inputText, setInputText] = useState<string>(() => {
    const v = formulaInsumo.cantidadInsumo;
    return typeof v === 'number' && v !== 0 ? String(v) : '';
  });
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // keep local text in sync when external model changes
    const v = formulaInsumo.cantidadInsumo;
    setInputText(typeof v === 'number' && v !== 0 ? String(v) : '');
  }, [formulaInsumo.cantidadInsumo]);

  const commit = () => {
    const raw = inputText.trim();
    if (raw === '') {
      onUpdate(index, 'cantidadInsumo', 0, true);
      return;
    }
    const normalized = raw.replace(',', '.');
    const parsed = parseFloat(normalized);
    onUpdate(index, 'cantidadInsumo', Number.isNaN(parsed) ? 0 : parsed, true);
  };

  // We keep a text state for editing (so empty shows blank). Commit on blur.

  return (
    <div ref={rowRef} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
      <div className="flex-1">
        <SearchSelect<Insumo>
          items={availableInsumos}
          value={formulaInsumo.insumo ?? null}
          getKey={(i) => i.id}
          getLabel={(i) => i.nombre}
          onSelect={(selected) => onUpdate(index, 'idInsumo', selected.id)}
          inputAutoFocus={autoFocus}
          placeholder="Seleccionar insumo"
          disabled={disabled}
        />
        <div className="mt-1 text-sm text-red-600">
          {rowErrors.length > 0 && <div>{rowErrors.join(' • ')}</div>}
        </div>
      </div>

      <div className="w-32">
        <input
          type="number"
          step="0.001"
          min={0}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onBlur={() => { commit(); onRowBlur && onRowBlur(index); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
          disabled={disabled}
          placeholder="Cantidad (g)"
          className={`w-full px-3 py-2 border ${'border-gray-300'} rounded-lg focus:outline-none focus:ring-[#5d5448] focus:border-[#5d5448] disabled:bg-gray-100 font-roboto text-sm`}
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={disabled}
        className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Eliminar insumo"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}