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
    // Leer los valores actuales dentro del updater para evitar incluirlos en deps
    // (incluirlos causaría un loop: el efecto escribe el campo que está en sus propias deps)
    setFormData((prev: any) => {
      if (prev.calculationMode === 'pesoNeto' && prev.pesoNeto > 0) {
        const calc = ProductoService.calculatePorcionesFromPesoNeto(prev.pesoNeto, selectedFormula.porcion || 0);
        return { ...prev, cantPorcionesAportadas: calc.cantPorcionesAportadas };
      }
      if (prev.calculationMode === 'porciones' && prev.cantPorcionesAportadas > 0) {
        const pesoNeto = ProductoService.calculatePesoNetoFromPorciones(prev.cantPorcionesAportadas, selectedFormula.porcion || 0);
        return { ...prev, pesoNeto };
      }
      return prev;
    });
  }, [selectedFormula, formData.calculationMode]);

  const handleCalculationModeChange = (mode: 'pesoNeto'|'porciones') => {
    setFormData((prev: any) => {
      const next: any = { ...prev, calculationMode: mode };
      // preserve existing values; if the target editable value is missing (0)
      // and the complementary value exists, compute it using selectedFormula
      if (mode === 'pesoNeto') {
        if ((!next.pesoNeto || next.pesoNeto === 0) && prev.cantPorcionesAportadas && selectedFormula && selectedFormula.porcion) {
          // compute pesoNeto from porciones
          next.pesoNeto = ProductoService.calculatePesoNetoFromPorciones(prev.cantPorcionesAportadas, selectedFormula.porcion || 0);
        }
        // keep cantPorcionesAportadas as-is so the UI still shows the last value
      } else {
        if ((!next.cantPorcionesAportadas || next.cantPorcionesAportadas === 0) && prev.pesoNeto && selectedFormula && selectedFormula.porcion) {
          const calc = ProductoService.calculatePorcionesFromPesoNeto(prev.pesoNeto, selectedFormula.porcion || 0);
          next.cantPorcionesAportadas = calc.cantPorcionesAportadas;
        }
        // keep pesoNeto as-is so the UI still shows the last value
      }
      return next;
    });
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
