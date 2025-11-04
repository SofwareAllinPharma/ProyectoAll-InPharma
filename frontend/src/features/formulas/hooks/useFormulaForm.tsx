import { useEffect, useState, useCallback } from 'react';
import type { CreateFormulaRequest, FormulaInsumo, Formula, NutritionCalculation } from '../types/formula.types';
import { calculateNutrition, validateFormulaInsumos, calculateTotalPeso } from '../utils/nutritionCalculator';

type Args = { formula?: Formula | null; isOpen: boolean; isCopyMode?: boolean; existingNames?: string[] };

export function useFormulaForm({ formula, isOpen, isCopyMode = false, existingNames = [] }: Args) {
  type F = { nombre: string; esProtegida: boolean };
  const [formData, setFormData] = useState<F>({ nombre: '', esProtegida: false });
  const [insumos, setInsumos] = useState<FormulaInsumo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [nutrition, setNutrition] = useState<NutritionCalculation>(() => ({ kcaloriasPorPorcion: 0, kjPorPorcion: 0, carbohidratosPorPorcion: 0, proteinasPorPorcion: 0, grasaTotalPorPorcion: 0, grasaSaturadaPorPorcion: 0, grasaTransPorPorcion: 0, fibraPorPorcion: 0, sodioPorPorcion: 0 }));

  useEffect(() => {
    if (!isOpen) return;
    if (formula) {
      const name = isCopyMode && formula.nombre && !formula.nombre.includes('Copia') ? `${formula.nombre} - Copia1` : formula.nombre;
      setFormData({ nombre: name, esProtegida: isCopyMode ? false : formula.esProtegida });
      setInsumos(formula.insumos || []);
      const e = validateFormulaInsumos(formula.insumos || []);
      setErrors(e.length ? { insumos: e.join(', ') } : {});
    } else { setFormData({ nombre: '', esProtegida: false }); setInsumos([]); setErrors({}); }
    setSubmitting(false);
  }, [isOpen, formula, isCopyMode]);

  useEffect(() => {
    const total = calculateTotalPeso(insumos);
    setNutrition(total > 0 ? calculateNutrition(insumos, total) : { kcaloriasPorPorcion: 0, kjPorPorcion: 0, carbohidratosPorPorcion: 0, proteinasPorPorcion: 0, grasaTotalPorPorcion: 0, grasaSaturadaPorPorcion: 0, grasaTransPorPorcion: 0, fibraPorPorcion: 0, sodioPorPorcion: 0 });
  }, [insumos]);

  const handleInputChange = useCallback((k: keyof F, v: F[keyof F]) => {
    setFormData(s => ({ ...s, [k]: v }));
    setErrors(prev => {
      const next = { ...prev };
      if (k === 'nombre') {
        const val = String(v).trim();
        next.nombre = !val ? 'El nombre es obligatorio' : (existingNames.includes(val) && (!formula || formula.nombre !== val) ? 'Ya existe una fórmula con ese nombre' : '');
      } else delete next[k as string];
      return next;
    });
  }, [existingNames, formula]);

  const handleInsumosChange = useCallback((list: FormulaInsumo[], touched = false) => {
    setInsumos(list);
    setErrors(prev => {
      const next = { ...prev };
      const e = validateFormulaInsumos(list);
      next.insumos = touched ? (e.length ? e.join(', ') : '') : prev.insumos || '';
      const total = calculateTotalPeso(list);
      next.porcion = touched ? (total <= 0 ? 'La porción debe ser mayor a 0' : '') : prev.porcion || '';
      return next;
    });
  }, [formula]);

  const validateForm = useCallback(() => {
    const n: Record<string, string> = {};
    if (!formData.nombre.trim()) n.nombre = 'El nombre es obligatorio';
    const total = calculateTotalPeso(insumos);
    if (total <= 0) n.porcion = 'La porción debe ser mayor a 0';
    if (!insumos.length) n.insumos = 'Debe agregar al menos un insumo';
    const e = validateFormulaInsumos(insumos); if (e.length) n.insumos = e.join(', ');
    setErrors(n); return !Object.keys(n).length;
  }, [formData, insumos]);

  const isValid = Object.values(errors).every(v => !v);

  const buildPayload = useCallback((): CreateFormulaRequest => ({ nombre: formData.nombre, porcion: calculateTotalPeso(insumos), esProtegida: formData.esProtegida, insumos: insumos.map(i => ({ idInsumo: i.idInsumo, cantidadInsumo: i.cantidadInsumo })) }), [formData, insumos]);

  const handleSubmit = useCallback(async (onSubmit: (p: CreateFormulaRequest) => Promise<unknown> | void) => {
    if (!validateForm() || submitting) return false; setSubmitting(true);
    try { await onSubmit(buildPayload()); return true; } finally { setSubmitting(false); }
  }, [validateForm, submitting, buildPayload]);

  return {
    formData,
    // new names
    insumos,
    nutrition,
    errors,
    submitting,
    isValid,
    handleInputChange,
    handleInsumosChange,
    validateForm,
    buildPayload,
    handleSubmit,
    setFormData,
    setInsumos,
    // legacy aliases for backwards compatibility
    formulaInsumos: insumos,
    nutritionValues: nutrition,
    isSubmitting: submitting,
    setFormulaInsumos: setInsumos,
  };
}
