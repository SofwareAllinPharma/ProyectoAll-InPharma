import { useEffect, useState } from 'react';
import { useProductoForm } from './useProductoForm';
import type { Producto } from '../types/producto.types';
import type { Formula } from '../../formulas/types/formula.types';

type FormState = {
  idFormula: number;
  nombreComercial: string;
  pesoNeto: number;
  cantPorcionesAportadas: number;
  calculationMode: 'pesoNeto' | 'porciones';
};

export function useProductoFormManager(args: {
  producto?: Producto;
  isOpen: boolean;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}){
  const { producto, isOpen, onSubmit, onClose } = args;
  const [formData, setFormData] = useState<FormState>({ idFormula:0, nombreComercial:'', pesoNeto:0, cantPorcionesAportadas:0, calculationMode:'pesoNeto' });
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setFormData({ idFormula:0, nombreComercial:'', pesoNeto:0, cantPorcionesAportadas:0, calculationMode:'pesoNeto' });
      setSelectedFormula(null);
      setErrors({});
      setServerError(null);
      return;
    }
    if (producto) {
      setFormData({ idFormula: producto.idFormula, nombreComercial: producto.nombreComercial, pesoNeto: producto.pesoNeto, cantPorcionesAportadas: producto.cantPorcionesAportadas, calculationMode:'pesoNeto' });
      setSelectedFormula(producto.formula || null);
    } else {
      setFormData({ idFormula:0, nombreComercial:'', pesoNeto:0, cantPorcionesAportadas:0, calculationMode:'pesoNeto' });
      setSelectedFormula(null);
    }
    setErrors({}); setServerError(null);
  }, [isOpen, producto]);

  const { handleCalculationModeChange, handleValueChange, validateForm } = useProductoForm({ formData, setFormData, selectedFormula });

  const onNombreChange = (v: string) => setFormData(prev => ({ ...prev, nombreComercial: v }));
  const onFormulaChange = (f: Formula) => { setSelectedFormula(f); setFormData(prev => ({ ...prev, idFormula: f.id, pesoNeto: 0, cantPorcionesAportadas: 0 })); };

  const handleSubmit = async () => {
    const newErrors = validateForm(formData);
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return false; }
    setIsSubmitting(true); setServerError(null);
    try {
      const submitData: any = { idFormula: formData.idFormula, nombreComercial: formData.nombreComercial.trim() };
      if (formData.calculationMode === 'pesoNeto') submitData.pesoNeto = formData.pesoNeto; else submitData.cantPorcionesAportadas = formData.cantPorcionesAportadas;
      await onSubmit(submitData);
      onClose();
      return true;
    } catch (err: any) {
      setServerError(err?.message || 'Error desconocido al guardar el producto');
      return false;
    } finally { setIsSubmitting(false); }
  };

  return {
    formData, selectedFormula, errors, serverError, isSubmitting,
    onNombreChange, onFormulaChange, onCalcModeChange: handleCalculationModeChange, onValueChange: handleValueChange,
    handleSubmit, setFormData, setSelectedFormula, setErrors,
  } as const;
}
