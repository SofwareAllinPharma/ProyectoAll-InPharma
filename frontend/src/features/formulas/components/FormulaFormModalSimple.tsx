import React, { useState, useEffect } from 'react';
import type { Formula, CreateFormulaRequest, FormulaInsumo, NutritionCalculation } from '../types/formula.types';
import { FormulaInsumoManager } from './FormulaInsumoManager';
import { calculateNutrition } from '../utils/nutritionCalculator';

interface FormulaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formula: CreateFormulaRequest) => Promise<void>;
  formula?: Formula | null;
  isLoading?: boolean;
  isCopyMode?: boolean;
}

export const FormulaFormModalSimple: React.FC<FormulaFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formula,
  isLoading = false,
  isCopyMode = false,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    esProtegida: false,
  });

  const [formulaInsumos, setFormulaInsumos] = useState<FormulaInsumo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nutritionValues, setNutritionValues] = useState<NutritionCalculation>({
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  type RowErrors = { idInsumo?: string; cantidadInsumo?: string; duplicate?: string };
  const [rowErrors, setRowErrors] = useState<Record<number, RowErrors>>({});
  const [touchedRows, setTouchedRows] = useState<Record<number, boolean>>({});

  const totalPeso = formulaInsumos.reduce((acc, x) => acc + (x.cantidadInsumo || 0), 0);

  // Calcular valores nutricionales cuando cambien los insumos (usar peso total)
  useEffect(() => {
    if (formulaInsumos.length > 0 && totalPeso > 0) {
      const nutrition = calculateNutrition(formulaInsumos, totalPeso);
      setNutritionValues(nutrition);
    } else {
      setNutritionValues({
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
      });
    }
  }, [formulaInsumos, totalPeso]);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      return;
    }

    if (formula) {
      setFormData({
        nombre: formula.nombre, // Usar el nombre que viene de la fórmula (ya procesado en el padre)
        esProtegida: isCopyMode ? false : formula.esProtegida,
      });
      setFormulaInsumos(formula.insumos || []);
    } else {
      setFormData({
        nombre: '',
        esProtegida: false,
      });
      setFormulaInsumos([]);
    }
    setErrors({});
  }, [isOpen, formula, isCopyMode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (totalPeso <= 0) {
      newErrors.general = 'Agregá insumos y cantidades > 0 para calcular el peso total.';
    }

    // validate rows (on submit validate all rows regardless of touched)
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newRowErrors).length === 0;
  };

  const validateRow = (index: number) => {
    const fi = formulaInsumos[index];
    const r: RowErrors = {};
    if (!fi) { setRowErrors(prev => { const c = { ...prev }; delete c[index]; return c; }); setTouchedRows(prev => { const c = { ...prev }; delete c[index]; return c; }); return; }

    // Only validate live if the row was touched; otherwise clear live errors
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

  // clearRowErrors intentionally removed; updates are handled via validateRow and onRowRemoved

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
  if (!validateForm() || isSubmitting) return;

    console.log('Modal: Enviando datos del formulario...', {
      nombre: formData.nombre,
      esProtegida: formData.esProtegida,
      insumosCount: formulaInsumos.length
    });

    setIsSubmitting(true);
    
    const dataToSend: CreateFormulaRequest = {
      nombre: formData.nombre,
      porcionMinima: totalPeso, // until backend changes contract
      esProtegida: formData.esProtegida,
      insumos: formulaInsumos.map(fi => ({
        idInsumo: fi.idInsumo,
        cantidadInsumo: fi.cantidadInsumo,
      })),
    };

    try {
      await onSubmit(dataToSend);
      console.log('Modal: onSubmit completado exitosamente');
    } catch (error) {
      console.error('Modal: Error en onSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[95vh] overflow-y-auto border border-gray-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">
            {formula && !isCopyMode ? 'Editar Fórmula' : 
             isCopyMode ? 'Crear Copia de Fórmula' : 'Agregar Nueva Fórmula'}
          </h2>

  <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Panel izquierdo - Datos básicos */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Información Básica</h3>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Fórmula
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingrese el nombre de la fórmula"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              {/* Porción ahora se calcula automáticamente como suma de insumos (peso total) */}

              {/* Protegida */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.esProtegida}
                    onChange={(e) => setFormData(prev => ({ ...prev, esProtegida: e.target.checked }))}
                    className="w-4 h-4 text-[#7c6a55] border-gray-300 rounded focus:ring-[#7c6a55]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Fórmula Protegida
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Las fórmulas protegidas no pueden ser editadas directamente
                </p>
              </div>

              {/* Información Nutricional Calculada */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Información Nutricional por Porción</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium">Kcalorías:</span> {nutritionValues.kcaloriasPorPorcion.toFixed(1)}
                  </div>
                  <div>
                    <span className="font-medium">Proteínas:</span> {nutritionValues.proteinasPorPorcion.toFixed(1)}g
                  </div>
                  <div>
                    <span className="font-medium">Grasas Tot.:</span> {nutritionValues.grasaTotalPorPorcion.toFixed(1)}g
                  </div>
                  <div>
                    <span className="font-medium">Carbohidratos:</span> {nutritionValues.carbohidratosPorPorcion.toFixed(1)}g
                  </div>
                  <div>
                    <span className="font-medium">Sodio:</span> {(nutritionValues.sodioPorPorcion * 1000).toFixed(1)}mg
                  </div>
                  <div>
                    <span className="font-medium">Fibra:</span> {nutritionValues.fibraPorPorcion.toFixed(1)}g
                  </div>
                </div>
              </div>
            </div>

            {/* Panel derecho - Insumos */}
            <div>
              <FormulaInsumoManager
                formulaInsumos={formulaInsumos}
                onChange={(insumos) => { setFormulaInsumos(insumos); }}
                disabled={isLoading}
                rowErrors={rowErrors}
                onValidateRow={(idx: number) => validateRow(idx)}
                onTouchRow={(idx: number) => setTouchedRows(prev => ({ ...prev, [idx]: true }))}
                onSetRowError={(idx: number, err) => setRowErrors(prev => ({ ...prev, [idx]: { ...(prev[idx]||{}), ...err } }))}
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
              {errors.general && <p className="mt-2 text-sm text-red-600">{errors.general}</p>}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 
                         focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 
                         font-medium transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="px-6 py-3 bg-[#7c6a55] text-white rounded-lg hover:bg-[#6b5847] 
                         focus:outline-none focus:ring-2 focus:ring-[#7c6a55] focus:ring-offset-2 
                         disabled:opacity-50 disabled:cursor-not-allowed font-medium 
                         transition-all duration-200 shadow-sm"
            >
              {(isLoading || isSubmitting) ? 'Guardando...' : 
               formula && !isCopyMode ? 'Actualizar' : 'Crear Fórmula'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};