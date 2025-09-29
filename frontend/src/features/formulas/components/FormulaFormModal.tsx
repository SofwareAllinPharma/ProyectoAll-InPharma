import React, { useState, useEffect } from 'react';
import type { Formula, CreateFormulaRequest, FormulaInsumo, NutritionCalculation } from '../types/formula.types';
import { FormulaInsumoManager } from './FormulaInsumoManager';
import { calculateNutrition, validateFormulaInsumos } from '../utils/nutritionCalculator';

interface FormulaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formula: CreateFormulaRequest) => void;
  formula?: Formula | null;
  isLoading?: boolean;
  isCopyMode?: boolean;
}

export const FormulaFormModal: React.FC<FormulaFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formula,
  isLoading = false,
  isCopyMode = false,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    porcionMinima: 100,
    esProtegida: false,
  });

  const [formulaInsumos, setFormulaInsumos] = useState<FormulaInsumo[]>([]);
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Calcular valores nutricionales automáticamente cuando cambian los insumos
  useEffect(() => {
    if (formulaInsumos.length > 0) {
      const calculatedNutrition = calculateNutrition(formulaInsumos, formData.porcionMinima);
      setNutritionValues(calculatedNutrition);
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
      });
    }
  }, [formulaInsumos, formData.porcionMinima]);

  useEffect(() => {
    if (isOpen && formula) {
      setFormData({
        nombre: isCopyMode ? `${formula.nombre} - Copia1` : formula.nombre,
        porcionMinima: formula.porcionMinima,
        esProtegida: isCopyMode ? false : formula.esProtegida,
      });
      
      // Si la fórmula tiene insumos, cargarlos
      if (formula.insumos && formula.insumos.length > 0) {
        setFormulaInsumos(formula.insumos);
      } else {
        setFormulaInsumos([]);
      }
      
      setHasChanges(false);
    } else if (isOpen) {
      // Resetear para nueva fórmula
      setFormData({
        nombre: '',
        porcionMinima: 100,
        esProtegida: false,
      });
      setFormulaInsumos([]);
      setHasChanges(false);
    }
    setErrors({});
  }, [isOpen, formula, isCopyMode]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInsumosChange = (insumos: FormulaInsumo[]) => {
    setFormulaInsumos(insumos);
    setHasChanges(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (formData.porcionMinima <= 0) {
      newErrors.porcionMinima = 'La porción mínima debe ser mayor a 0';
    }

    // Validar que haya al menos un insumo
    if (formulaInsumos.length === 0) {
      newErrors.insumos = 'Debe agregar al menos un insumo a la fórmula';
    }

    // Validar insumos usando la función del calculador
    const insumosErrors = validateFormulaInsumos(formulaInsumos);
    if (insumosErrors.length > 0) {
      newErrors.insumos = insumosErrors.join(', ');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dataToSend: CreateFormulaRequest = {
      ...formData,
      insumos: formulaInsumos.map(fi => ({
        idInsumo: fi.idInsumo,
        cantidadInsumo: fi.cantidadInsumo,
      })),
    };

    onSubmit(dataToSend);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#3e3529] mb-6 font-playfair">
          {formula && !isCopyMode ? 'Editar Fórmula' :
            isCopyMode ? 'Crear Copia de Fórmula' : 'Agregar Nueva Fórmula'}
        </h2>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm font-roboto">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-merriweather">
                  Nombre de la Fórmula
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] font-roboto ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingrese el nombre de la fórmula"
                  disabled={isLoading}
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600 font-roboto">{errors.nombre}</p>
                )}
              </div>

              {/* Porción Mínima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-merriweather">
                  Porción Mínima (g)
                </label>
                <input
                  type="number"
                  value={formData.porcionMinima}
                  onChange={(e) => handleInputChange('porcionMinima', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] font-roboto ${
                    errors.porcionMinima ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="100"
                  min="1"
                  disabled={isLoading}
                />
                {errors.porcionMinima && (
                  <p className="mt-1 text-sm text-red-600 font-roboto">{errors.porcionMinima}</p>
                )}
              </div>
            </div>

            {/* Checkbox Protegida */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.esProtegida}
                  onChange={(e) => handleInputChange('esProtegida', e.target.checked)}
                  className="w-4 h-4 text-[#7c6a55] border-gray-300 rounded focus:ring-[#7c6a55]"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-700 font-merriweather">
                  Fórmula Protegida
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 font-roboto">
                Las fórmulas protegidas no pueden ser editadas directamente
              </p>
            </div>

            {/* Gestión de Insumos */}
            <div>
              <h3 className="text-lg font-semibold text-[#3e3529] mb-4 font-playfair">
                Composición de Insumos
              </h3>
              <FormulaInsumoManager
                formulaInsumos={formulaInsumos}
                onChange={handleInsumosChange}
                disabled={isLoading}
              />
              {errors.insumos && (
                <p className="mt-2 text-sm text-red-600 font-roboto">{errors.insumos}</p>
              )}
            </div>

            {/* Información Nutricional Calculada */}
            {formulaInsumos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#3e3529] mb-4 font-playfair">
                  Información Nutricional por Porción ({formData.porcionMinima}g)
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 font-merriweather">Calorías:</span>
                      <span className="font-roboto">{nutritionValues.kcaloriasPorPorcion.toFixed(1)} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 font-merriweather">Kilojoules:</span>
                      <span className="font-roboto">{nutritionValues.kjPorPorcion.toFixed(1)} kJ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 font-merriweather">Carbohidratos:</span>
                      <span className="font-roboto">{nutritionValues.carbohidratosPorPorcion.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 font-merriweather">Proteínas:</span>
                      <span className="font-roboto">{nutritionValues.proteinasPorPorcion.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 font-merriweather">Grasas Totales:</span>
                      <span className="font-roboto">{nutritionValues.grasaTotalPorPorcion.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 font-merriweather">Grasas Saturadas:</span>
                      <span className="font-roboto">{nutritionValues.grasaSaturadaPorPorcion.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 font-merriweather">Grasas Trans:</span>
                      <span className="font-roboto">{nutritionValues.grasaTransPorPorcion.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 font-merriweather">Fibra:</span>
                      <span className="font-roboto">{nutritionValues.fibraPorPorcion.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 font-merriweather">Sodio:</span>
                      <span className="font-roboto">{(nutritionValues.sodioPorPorcion * 1000).toFixed(1)}mg</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 
                         focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 
                         font-roboto font-medium transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || (!hasChanges && !formula)}
              className="px-6 py-2 bg-[#7c6a55] text-white rounded-md hover:bg-[#6b5847] 
                         focus:outline-none focus:ring-2 focus:ring-[#7c6a55] focus:ring-offset-2 
                         disabled:opacity-50 disabled:cursor-not-allowed font-roboto font-medium 
                         transition-colors"
            >
              {isLoading
                ? 'Guardando...'
                : formula && !isCopyMode
                ? 'Actualizar Fórmula'
                : 'Crear Fórmula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
