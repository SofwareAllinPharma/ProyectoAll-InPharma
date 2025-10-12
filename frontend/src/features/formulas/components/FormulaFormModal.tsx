import React, { useState, useEffect } from 'react';
import type { Formula, CreateFormulaRequest, FormulaInsumo, NutritionCalculation } from '../types/formula.types';
import { calculateNutrition, validateFormulaInsumos } from '../utils/nutritionCalculator';
import FormulaFormFields from './FormulaFormFields';
import FormulaFormFooter from './FormulaFormFooter';

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
  const [formData, setFormData] = useState({ nombre: '', porcionMinima: 100, esProtegida: false });
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
    if (formulaInsumos.length > 0) setNutritionValues(calculateNutrition(formulaInsumos, formData.porcionMinima));
    else setNutritionValues({ kcaloriasPorPorcion: 0, kjPorPorcion: 0, carbohidratosPorPorcion: 0, proteinasPorPorcion: 0, grasaTotalPorPorcion: 0, grasaSaturadaPorPorcion: 0, grasaTransPorPorcion: 0, fibraPorPorcion: 0, sodioPorPorcion: 0 });
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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleInsumosChange = (insumos: FormulaInsumo[]) => { setFormulaInsumos(insumos); setHasChanges(true); };

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
        <h2 className="text-2xl font-bold text-[#3e3529] mb-6 font-playfair">{formula && !isCopyMode ? 'Editar Fórmula' : isCopyMode ? 'Crear Copia de Fórmula' : 'Agregar Nueva Fórmula'}</h2>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm font-roboto">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormulaFormFields
            formData={formData}
            onInputChange={handleInputChange}
            formulaInsumos={formulaInsumos}
            onInsumosChange={handleInsumosChange}
            errors={errors}
            isLoading={isLoading}
            nutritionValues={nutritionValues}
          />

          <FormulaFormFooter onClose={onClose} isLoading={isLoading} submitLabel={formula && !isCopyMode ? 'Actualizar Fórmula' : 'Crear Fórmula'} />
        </form>
      </div>
    </div>
  );
};
