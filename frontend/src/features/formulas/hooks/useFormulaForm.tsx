import { useEffect, useState, useCallback } from 'react';
import type { CreateFormulaRequest, FormulaInsumo, Formula, NutritionCalculation } from '../types/formula.types';
import { calculateNutrition, validateFormulaInsumos } from '../utils/nutritionCalculator';

type UseFormulaFormArgs = {
  formula?: Formula | null;
  isOpen: boolean;
  isCopyMode?: boolean;
};

export function useFormulaForm({ formula, isOpen, isCopyMode = false }: UseFormulaFormArgs) {
  const [formData, setFormData] = useState({ nombre: '', porcionMinima: 100, esProtegida: false });
  const [formulaInsumos, setFormulaInsumos] = useState<FormulaInsumo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nutritionValues, setNutritionValues] = useState<NutritionCalculation>(() => ({
    kcaloriasPorPorcion: 0,
    kjPorPorcion: 0,
    carbohidratosPorPorcion: 0,
    proteinasPorPorcion: 0,
    grasaTotalPorPorcion: 0,
    grasaSaturadaPorPorcion: 0,
    grasaTransPorPorcion: 0,
    fibraPorPorcion: 0,
    sodioPorPorcion: 0,
  }));

  // sync when modal opens / formula changes
  useEffect(() => {
    if (!isOpen) return;
    if (formula) {
      const suggestedName = isCopyMode && formula.nombre && !formula.nombre.includes('Copia') ? `${formula.nombre} - Copia1` : formula.nombre;
      setFormData({
        nombre: suggestedName,
        porcionMinima: formula.porcionMinima,
        esProtegida: isCopyMode ? false : formula.esProtegida,
      });
      setFormulaInsumos(formula.insumos || []);
    } else {
      setFormData({ nombre: '', porcionMinima: 100, esProtegida: false });
      setFormulaInsumos([]);
    }
    setErrors({});
    setIsSubmitting(false);
  }, [isOpen, formula, isCopyMode]);

  // calculate nutrition when inputs change
  useEffect(() => {
    if (formulaInsumos.length > 0 && formData.porcionMinima > 0) {
      setNutritionValues(calculateNutrition(formulaInsumos, formData.porcionMinima));
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

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleInsumosChange = useCallback((insumos: FormulaInsumo[]) => {
    setFormulaInsumos(insumos);
    if (errors.insumos) setErrors(prev => ({ ...prev, insumos: '' }));
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (formData.porcionMinima <= 0) newErrors.porcionMinima = 'La porción mínima debe ser mayor a 0';
    if (formulaInsumos.length === 0) newErrors.insumos = 'Debe agregar al menos un insumo';
    const insumosErrors = validateFormulaInsumos(formulaInsumos);
    if (insumosErrors.length > 0) newErrors.insumos = insumosErrors.join(', ');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, formulaInsumos]);

  const buildPayload = useCallback((): CreateFormulaRequest => ({
    nombre: formData.nombre,
    porcionMinima: formData.porcionMinima,
    esProtegida: formData.esProtegida,
    insumos: formulaInsumos.map(fi => ({ idInsumo: fi.idInsumo, cantidadInsumo: fi.cantidadInsumo })),
  }), [formData, formulaInsumos]);

  const handleSubmit = useCallback(async (onSubmit: (payload: CreateFormulaRequest) => Promise<any> | void) => {
    if (!validateForm() || isSubmitting) return false;
    setIsSubmitting(true);
    try {
      await onSubmit(buildPayload());
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, isSubmitting, buildPayload]);

  return {
    formData,
    formulaInsumos,
    nutritionValues,
    errors,
    isSubmitting,
    handleInputChange,
    handleInsumosChange,
    validateForm,
    buildPayload,
    handleSubmit,
    setFormData,
    setFormulaInsumos,
  };
}
