import { useEffect, useMemo, useState } from 'react';
import type { CreateProductoRequest, Producto, UpdateProductoRequest } from '../types/producto.types';
import type { Formula, FormulaInsumo } from '../../formulas/types/formula.types';
import { calculatePresentation, directComposition, initialProductoForm, productoFormPayload, validateProductoForm } from '../lib/composition';

export function useProductoFormManager(args: {
  producto?: Producto; isOpen: boolean;
  onSubmit: (data: CreateProductoRequest | UpdateProductoRequest) => Promise<void>;
  onClose: () => void;
}) {
  const { producto, isOpen, onSubmit, onClose } = args;
  const [state, setFormData] = useState(() => initialProductoForm());
  const [formula, setSelectedFormula] = useState<Formula | null>(null);
  const [insumos, setInsumos] = useState<FormulaInsumo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(initialProductoForm(isOpen ? producto : undefined));
    setSelectedFormula(isOpen && producto?.formula?.tipoComposicion !== 'producto' ? producto?.formula ?? null : null);
    setInsumos(isOpen && producto?.formula?.tipoComposicion === 'producto' ? producto.formula.insumos ?? [] : []);
    setErrors({}); setServerError(null); setIsSubmitting(false);
  }, [isOpen, producto]);

  const selectedFormula = useMemo(() => state.tipoComposicion === 'insumos' ? directComposition(insumos) : formula, [state.tipoComposicion, insumos, formula]);
  const formData = calculatePresentation(state, selectedFormula?.porcion ?? 0);
  const onNombreChange = (value: string) => setFormData(prev => ({ ...prev, nombreComercial: value }));
  const onSkuChange = (value: string) => setFormData(prev => ({ ...prev, sku: value }));
  const onDiasVencimientoChange = (value: string) => setFormData(prev => ({ ...prev, diasVencimiento: value }));
  const onFormulaChange = (f: Formula) => { setSelectedFormula(f); setFormData(prev => ({ ...prev, idFormula: f.id })); };
  const onCompositionModeChange = (tipoComposicion: 'formula' | 'insumos') => {
    setErrors({}); setServerError(null);
    setFormData(prev => ({ ...calculatePresentation(prev, selectedFormula?.porcion ?? 0), tipoComposicion, calculationMode: tipoComposicion === 'insumos' ? 'porciones' : prev.calculationMode }));
  };
  const onCalcModeChange = (calculationMode: 'pesoNeto' | 'porciones') => setFormData({ ...formData, calculationMode });
  const onValueChange = (field: 'pesoNeto' | 'cantPorcionesAportadas', value: number) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const newErrors = validateProductoForm(formData, insumos);
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return false; }
    if (isSubmitting) return false;
    setIsSubmitting(true); setServerError(null);
    try {
      await onSubmit(productoFormPayload(formData, insumos));
      onClose(); return true;
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al guardar el producto'); return false;
    } finally { setIsSubmitting(false); }
  };
  return { formData, selectedFormula, insumos, setInsumos, errors, serverError, isSubmitting, onNombreChange, onSkuChange, onDiasVencimientoChange, onFormulaChange, onCompositionModeChange, onCalcModeChange, onValueChange, handleSubmit };
}
