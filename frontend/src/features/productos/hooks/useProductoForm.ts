import { useEffect } from 'react';
import { ProductoService } from '../services/producto.service';
import type { Formula } from '../../formulas/types/formula.types';

export function useProductoForm(params: {
  formData: { pesoNeto: number; cantPorcionesAportadas: number; calculationMode: 'pesoNeto'|'porciones'; },
  setFormData: (updater: any) => void,
  selectedFormula: Formula | null,
}){
  const { formData, setFormData, selectedFormula } = params;

  useEffect(() => {
    if (!selectedFormula) return;
    if (selectedFormula && formData.calculationMode === 'pesoNeto' && formData.pesoNeto > 0) {
      const calculation = ProductoService.calculatePorcionesFromPesoNeto(
        formData.pesoNeto,
        selectedFormula.porcionMinima || 0
      );
      setFormData((prev: any) => ({ ...prev, cantPorcionesAportadas: calculation.cantPorcionesAportadas }));
    } else if (selectedFormula && formData.calculationMode === 'porciones' && formData.cantPorcionesAportadas > 0) {
      const pesoNeto = ProductoService.calculatePesoNetoFromPorciones(
        formData.cantPorcionesAportadas,
        selectedFormula.porcionMinima || 0
      );
      setFormData((prev: any) => ({ ...prev, pesoNeto }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFormula, formData.calculationMode, formData.pesoNeto, formData.cantPorcionesAportadas]);

  const handleCalculationModeChange = (mode: 'pesoNeto'|'porciones') => {
    setFormData((prev: any) => ({ ...prev, calculationMode: mode, pesoNeto: 0, cantPorcionesAportadas: 0 }));
  };

  const handleValueChange = (field: 'pesoNeto'|'cantPorcionesAportadas', value: number) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const validateForm = (formDataFull: any) => {
    const newErrors: Record<string,string> = {};
    if (!formDataFull.nombreComercial || !String(formDataFull.nombreComercial).trim()) newErrors.nombreComercial = 'El nombre comercial es obligatorio';
    if (!formDataFull.idFormula || formDataFull.idFormula === 0) newErrors.idFormula = 'Debe seleccionar una fórmula';
    if (!formDataFull.pesoNeto || formDataFull.pesoNeto <= 0) newErrors.pesoNeto = 'El peso neto debe ser mayor a 0';
    if (!formDataFull.cantPorcionesAportadas || formDataFull.cantPorcionesAportadas <= 0) newErrors.cantPorcionesAportadas = 'Las porciones deben ser mayor a 0';
    return newErrors;
  };

  return { handleCalculationModeChange, handleValueChange, validateForm };
}
