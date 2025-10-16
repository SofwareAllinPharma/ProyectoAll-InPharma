import React, { useState } from 'react';
import type { Formula, CreateFormulaRequest } from '../../types/formula.types';
import { useFormulaForm } from '../../hooks/useFormulaForm';
import FormModal from '../../../../components/ui/modales/FormModal';
import { FormulaInsumoManager } from './insumos/FormulaInsumoManager';
import { calculateNutrition } from '../../utils/nutritionCalculator';

interface FormulaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formula: CreateFormulaRequest) => Promise<void> | void;
  formula?: Formula | null;
  isLoading?: boolean;
  isCopyMode?: boolean;
}

export const FormulaFormModal: React.FC<FormulaFormModalProps> = ({ isOpen, onClose, onSubmit, formula, isLoading = false, isCopyMode = false }) => {
  const formId = 'formula-form';
  const { formData, formulaInsumos, isSubmitting, handleInputChange, handleInsumosChange } = useFormulaForm({ formula: formula ?? null, isOpen, isCopyMode });

  type RowErrors = { idInsumo?: string; cantidadInsumo?: string; duplicate?: string };
  const [rowErrors, setRowErrors] = useState<Record<number, RowErrors>>({});
  const [touchedRows, setTouchedRows] = useState<Record<number, boolean>>({});

  const totalPeso = formulaInsumos.reduce((acc, x) => acc + (x.cantidadInsumo || 0), 0);

  // derive nutrition from totalPeso instead of formData.porcionMinima
  const localNutrition = (formulaInsumos.length > 0 && totalPeso > 0)
    ? calculateNutrition(formulaInsumos, totalPeso)
    : {
      kcaloriasPorPorcion: 0,
      kjPorPorcion: 0,
      carbohidratosPorPorcion: 0,
      proteinasPorPorcion: 0,
      grasaTotalPorPorcion: 0,
      grasaSaturadaPorPorcion: 0,
      grasaTransPorPorcion: 0,
      fibraPorPorcion: 0,
      sodioPorPorcion: 0,
      otrosPorPorcion: 0,
    };

  const validateRow = (index: number) => {
    const fi = formulaInsumos[index];
    const r: RowErrors = {};
    if (!fi) {
      setRowErrors(prev => { const c = { ...prev }; delete c[index]; return c; });
      setTouchedRows(prev => { const c = { ...prev }; delete c[index]; return c; });
      return;
    }

    const touched = !!touchedRows[index];
    if (!touched) {
      setRowErrors(prev => { const c = { ...prev }; delete c[index]; return c; });
      return;
    }

    if (!fi.cantidadInsumo || fi.cantidadInsumo <= 0) r.cantidadInsumo = 'La cantidad debe ser mayor a 0 g';
    const dup = formulaInsumos.findIndex((other, i) => other.idInsumo === fi.idInsumo && i !== index && fi.idInsumo !== 0);
    if (dup !== -1) r.duplicate = 'Este insumo ya fue agregado';
    setRowErrors(prev => { const c = { ...prev }; if (Object.keys(r).length === 0) delete c[index]; else c[index] = r; return c; });
  };

  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (totalPeso <= 0) newErrors.general = 'Agregá insumos y cantidades > 0 para calcular el peso total.';

    // build per-row errors
    const newRowErrors: Record<number, RowErrors> = {};
    formulaInsumos.forEach((fi, idx) => {
      const r: RowErrors = {};
      if (!fi.idInsumo || fi.idInsumo === 0) r.idInsumo = 'Seleccioná un insumo';
      if (!fi.cantidadInsumo || fi.cantidadInsumo <= 0) r.cantidadInsumo = 'La cantidad debe ser mayor a 0 g';
      const dup = formulaInsumos.findIndex((other, i) => other.idInsumo === fi.idInsumo && i !== idx && fi.idInsumo !== 0);
      if (dup !== -1) r.duplicate = 'Este insumo ya fue agregado';
      if (Object.keys(r).length > 0) newRowErrors[idx] = r;
    });

    setRowErrors(newRowErrors);
    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newRowErrors).length === 0;
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmittingLocal) return;
    setIsSubmittingLocal(true);
    const payload = {
      nombre: formData.nombre,
      porcionMinima: totalPeso,
      esProtegida: formData.esProtegida,
      insumos: formulaInsumos.map(fi => ({ idInsumo: fi.idInsumo, cantidadInsumo: fi.cantidadInsumo })),
    } as CreateFormulaRequest;
    try {
      await onSubmit(payload);
    } catch (err) {
      console.error('Error al enviar fórmula:', err);
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FormModal open={isOpen} onClose={onClose} title={formula && !isCopyMode ? 'Editar Fórmula' : isCopyMode ? 'Crear Copia de Fórmula' : 'Agregar Nueva Fórmula'} formId={formId} loading={isLoading || isSubmitting || isSubmittingLocal}>
      <form id={formId} onSubmit={handleLocalSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Información Básica</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Fórmula</label>
                <input type="text" value={formData.nombre} onChange={(e) => handleInputChange('nombre', e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] ${localErrors.nombre ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ingrese el nombre de la fórmula" />
                {localErrors.nombre && <p className="mt-1 text-sm text-red-600">{localErrors.nombre}</p>}
              </div>

              {/* Porción mínima removed: now calculated from insumos (totalPeso) */}

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.esProtegida} onChange={(e) => handleInputChange('esProtegida', e.target.checked)} className="w-4 h-4 text-[#7c6a55] border-gray-300 rounded focus:ring-[#7c6a55]" />
                  <span className="text-sm font-medium text-gray-700">Fórmula Protegida</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Las fórmulas protegidas no pueden ser editadas directamente</p>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Información Nutricional por Porción</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="font-medium">Kcalorías:</span> {localNutrition.kcaloriasPorPorcion.toFixed(1)}</div>
                  <div><span className="font-medium">kJ:</span> {localNutrition.kjPorPorcion.toFixed(1)}</div>
                  <div><span className="font-medium">Grasas Totales:</span> {localNutrition.grasaTotalPorPorcion.toFixed(2)}g</div>
                  <div><span className="font-medium">Grasas Trans:</span> {localNutrition.grasaTransPorPorcion.toFixed(2)}g</div>
                  <div><span className="font-medium">Grasas Saturadas:</span> {localNutrition.grasaSaturadaPorPorcion.toFixed(2)}g</div>
                  <div><span className="font-medium">Proteínas:</span> {localNutrition.proteinasPorPorcion.toFixed(2)}g</div>
                  <div><span className="font-medium">Carbohidratos:</span> {localNutrition.carbohidratosPorPorcion.toFixed(2)}g</div>
                  <div><span className="font-medium">Sodio:</span> {(localNutrition.sodioPorPorcion * 1000).toFixed(2)}mg</div>
                  <div><span className="font-medium">Fibra:</span> {localNutrition.fibraPorPorcion.toFixed(2)}g</div>
                  <div><span className="font-medium">Otros:</span> {(localNutrition.otrosPorPorcion || 0).toFixed(2)}g</div>
                </div>
              </div>
            </div>

            <div>
              <FormulaInsumoManager
                formulaInsumos={formulaInsumos}
                onChange={handleInsumosChange}
                disabled={isLoading || isSubmitting}
                rowErrors={rowErrors}
                onValidateRow={(idx: number) => validateRow(idx)}
                onTouchRow={(idx: number) => setTouchedRows(prev => ({ ...prev, [idx]: true }))}
                onSetRowError={(idx: number, err: RowErrors) => setRowErrors(prev => ({ ...prev, [idx]: { ...(prev[idx]||{}), ...err } }))}
                onRowRemoved={(idx: number) => {
                  setRowErrors(prev => {
                    const copy: Record<number, RowErrors> = {};
                    Object.keys(prev).map(k => parseInt(k, 10)).forEach((k) => {
                      if (k < idx) copy[k] = prev[k];
                      else if (k > idx) copy[k-1] = prev[k];
                    });
                    return copy;
                  });
                  setTouchedRows(prev => {
                    const copy: Record<number, boolean> = {};
                    Object.keys(prev).map(k => parseInt(k, 10)).forEach((k) => {
                      if (k < idx) copy[k] = prev[k];
                      else if (k > idx) copy[k-1] = prev[k];
                    });
                    return copy;
                  });
                }}
                totalPeso={totalPeso}
              />
              {localErrors.general && <p className="mt-2 text-sm text-red-600">{localErrors.general}</p>}
            </div>
          </div>

          <div className="h-6" />
        </form>
    </FormModal>
  );
};