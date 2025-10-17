import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Producto, CreateProductoRequest, UpdateProductoRequest } from '../types/producto.types';
import type { Formula } from '../../formulas/types/formula.types';
import { ProductoService } from '../services/producto.service';
import { FormulaService } from '../../formulas/services/formula.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductoRequest | UpdateProductoRequest) => Promise<void>;
  producto?: Producto;
  isLoading?: boolean;
}

interface FormData {
  idFormula: number;
  nombreComercial: string;
  pesoNeto: number;
  cantPorcionesAportadas: number;
  calculationMode: 'pesoNeto' | 'porciones';
}

export const ProductoFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  producto,
  // isLoading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    idFormula: 0,
    nombreComercial: '',
    pesoNeto: 0,
    cantPorcionesAportadas: 0,
    calculationMode: 'pesoNeto',
  });

  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFormulas, setIsLoadingFormulas] = useState(false);

  // Cargar fórmulas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadFormulas();
    }
  }, [isOpen]);

  // Inicializar formulario cuando se pasa un producto
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      return;
    }

    if (producto) {
      setFormData({
        idFormula: producto.idFormula,
        nombreComercial: producto.nombreComercial,
        pesoNeto: producto.pesoNeto,
        cantPorcionesAportadas: producto.cantPorcionesAportadas,
        calculationMode: 'pesoNeto',
      });
      setSelectedFormula(producto.formula || null);
    } else {
      setFormData({
        idFormula: 0,
        nombreComercial: '',
        pesoNeto: 0,
        cantPorcionesAportadas: 0,
        calculationMode: 'pesoNeto',
      });
      setSelectedFormula(null);
    }
    setErrors({});
  }, [isOpen, producto]);

  // Recalcular cuando cambia la fórmula seleccionada o el modo de cálculo
  useEffect(() => {
    if (selectedFormula && formData.calculationMode === 'pesoNeto' && formData.pesoNeto > 0) {
      const calculation = ProductoService.calculatePorcionesFromPesoNeto(
        formData.pesoNeto,
        selectedFormula.porcion || selectedFormula.porcionMinima || 0
      );
      setFormData(prev => ({
        ...prev,
        cantPorcionesAportadas: calculation.cantPorcionesAportadas,
      }));
    } else if (selectedFormula && formData.calculationMode === 'porciones' && formData.cantPorcionesAportadas > 0) {
      const pesoNeto = ProductoService.calculatePesoNetoFromPorciones(
        formData.cantPorcionesAportadas,
        selectedFormula.porcion || selectedFormula.porcionMinima || 0
      );
      setFormData(prev => ({
        ...prev,
        pesoNeto,
      }));
    }
  }, [selectedFormula, formData.calculationMode, formData.pesoNeto, formData.cantPorcionesAportadas]);

  const loadFormulas = async () => {
    setIsLoadingFormulas(true);
    try {
      const formulasData = await FormulaService.getAllFormulas();
      const formulasActivas = formulasData.filter(f => f.insumos && f.insumos.length > 0);
      setFormulas(formulasActivas);
    } catch (error) {
      console.error('Error al cargar fórmulas:', error);
      setFormulas([]);
    } finally {
      setIsLoadingFormulas(false);
    }
  };

  const handleFormulaChange = (formulaId: number) => {
    const formula = formulas.find(f => f.id === formulaId) || null;
    setSelectedFormula(formula);
    setFormData(prev => ({
      ...prev,
      idFormula: formulaId,
      pesoNeto: 0,
      cantPorcionesAportadas: 0,
    }));
  };

  const handleCalculationModeChange = (mode: 'pesoNeto' | 'porciones') => {
    setFormData(prev => ({
      ...prev,
      calculationMode: mode,
      pesoNeto: 0,
      cantPorcionesAportadas: 0,
    }));
  };

  const handleValueChange = (field: 'pesoNeto' | 'cantPorcionesAportadas', value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombreComercial.trim()) {
      newErrors.nombreComercial = 'El nombre comercial es obligatorio';
    }

    if (formData.idFormula === 0) {
      newErrors.idFormula = 'Debe seleccionar una fórmula';
    }

    if (formData.pesoNeto <= 0) {
      newErrors.pesoNeto = 'El peso neto debe ser mayor a 0';
    }

    if (formData.cantPorcionesAportadas <= 0) {
      newErrors.cantPorcionesAportadas = 'Las porciones deben ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData: CreateProductoRequest | UpdateProductoRequest = {
        idFormula: formData.idFormula,
        nombreComercial: formData.nombreComercial.trim(),
        pesoNeto: formData.pesoNeto,
        cantPorcionesAportadas: formData.cantPorcionesAportadas,
        calculationMode: formData.calculationMode,
        ...(producto && { idProducto: producto.idProducto }),
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error al guardar producto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPorcionesDisplay = (): string => {
    if (!selectedFormula || formData.cantPorcionesAportadas === 0) return '';
    
    const porcionesCompletas = Math.floor(formData.cantPorcionesAportadas);
    const porcionParcial = formData.cantPorcionesAportadas - porcionesCompletas;
    const pesoPorPorcion = selectedFormula.porcion || selectedFormula.porcionMinima || 0;
    const pesoParcial = porcionParcial * pesoPorPorcion;
    
    if (pesoParcial < 0.01) {
      return `${porcionesCompletas} porciones completas`;
    }
    
    return `${porcionesCompletas} porciones completas + ${pesoParcial.toFixed(1)}g`;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/30 z-[10000] flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {producto ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre Comercial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Comercial
            </label>
            <input
              type="text"
              value={formData.nombreComercial}
              onChange={(e) => setFormData(prev => ({ ...prev, nombreComercial: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] ${
                errors.nombreComercial ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese el nombre comercial del producto"
            />
            {errors.nombreComercial && (
              <p className="mt-1 text-sm text-red-600">{errors.nombreComercial}</p>
            )}
          </div>

          {/* Fórmula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fórmula
            </label>
            <select
              value={formData.idFormula}
              onChange={(e) => handleFormulaChange(parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] ${
                errors.idFormula ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoadingFormulas}
            >
              <option value={0}>
                {isLoadingFormulas ? 'Cargando fórmulas...' : 'Seleccione una fórmula'}
              </option>
              {formulas.map((formula) => (
                <option key={formula.id} value={formula.id}>
                  {formula.nombre} ({formula.porcion || formula.porcionMinima || 0}g por porción)
                  {formula.esProtegida ? ' - Protegida' : ''}
                </option>
              ))}
            </select>
            {errors.idFormula && (
              <p className="mt-1 text-sm text-red-600">{errors.idFormula}</p>
            )}
          </div>

          {/* Modo de Cálculo */}
          {selectedFormula && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Método de Cálculo
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="calculationMode"
                    value="pesoNeto"
                    checked={formData.calculationMode === 'pesoNeto'}
                    onChange={(e) => handleCalculationModeChange(e.target.value as 'pesoNeto')}
                    className="mr-2 text-[#7c6a55] focus:ring-[#7c6a55]"
                  />
                  <span className="text-sm">Ingresar peso neto (calcula porciones automáticamente)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="calculationMode"
                    value="porciones"
                    checked={formData.calculationMode === 'porciones'}
                    onChange={(e) => handleCalculationModeChange(e.target.value as 'porciones')}
                    className="mr-2 text-[#7c6a55] focus:ring-[#7c6a55]"
                  />
                  <span className="text-sm">Ingresar cantidad de porciones (calcula peso neto automáticamente)</span>
                </label>
              </div>
            </div>
          )}

          {/* Campos de entrada según modo de cálculo */}
          {selectedFormula && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Peso Neto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso Neto (g)
                  {formData.calculationMode === 'porciones' && (
                    <span className="text-xs text-gray-500"> (calculado)</span>
                  )}
                </label>
                <input
                  type="number"
                  value={formData.pesoNeto || ''}
                  onChange={(e) => handleValueChange('pesoNeto', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] ${
                    formData.calculationMode === 'porciones' ? 'bg-gray-50 cursor-not-allowed' : ''
                  } ${errors.pesoNeto ? 'border-red-500' : 'border-gray-300'}`}
                  min="0"
                  step="0.01"
                  readOnly={formData.calculationMode === 'porciones'}
                />
                {errors.pesoNeto && (
                  <p className="mt-1 text-sm text-red-600">{errors.pesoNeto}</p>
                )}
              </div>

              {/* Cantidad de Porciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad de Porciones
                  {formData.calculationMode === 'pesoNeto' && (
                    <span className="text-xs text-gray-500"> (calculado)</span>
                  )}
                </label>
                <input
                  type="number"
                  value={formData.cantPorcionesAportadas || ''}
                  onChange={(e) => handleValueChange('cantPorcionesAportadas', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] ${
                    formData.calculationMode === 'pesoNeto' ? 'bg-gray-50 cursor-not-allowed' : ''
                  } ${errors.cantPorcionesAportadas ? 'border-red-500' : 'border-gray-300'}`}
                  min="0"
                  step="0.01"
                  readOnly={formData.calculationMode === 'pesoNeto'}
                />
                {errors.cantPorcionesAportadas && (
                  <p className="mt-1 text-sm text-red-600">{errors.cantPorcionesAportadas}</p>
                )}
              </div>
            </div>
          )}

          {/* Información calculada */}
          {selectedFormula && formData.cantPorcionesAportadas > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Información del Producto</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Fórmula:</strong> {selectedFormula.nombre}</p>
                <p><strong>Peso por porción:</strong> {selectedFormula.porcion || selectedFormula.porcionMinima || 0}g</p>
                <p><strong>Peso neto total:</strong> {formData.pesoNeto.toFixed(2)}g</p>
                <p><strong>Distribución:</strong> {formatPorcionesDisplay()}</p>
              </div>
            </div>
          )}

          {/* Información nutricional */}
          {selectedFormula && formData.cantPorcionesAportadas > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Información Nutricional Total del Producto</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-medium">Kcalorías:</span> {((selectedFormula.kcalorias || selectedFormula.kcaloriasPorPorcion || 0) * formData.cantPorcionesAportadas).toFixed(1)}
                </div>
                <div>
                  <span className="font-medium">Proteínas:</span> {((selectedFormula.proteinas || selectedFormula.proteinasPorPorcion || 0) * formData.cantPorcionesAportadas).toFixed(1)}g
                </div>
                <div>
                  <span className="font-medium">Grasas Totales:</span> {((selectedFormula.grasaTotal || selectedFormula.grasaTotalPorPorcion || 0) * formData.cantPorcionesAportadas).toFixed(1)}g
                </div>
                <div>
                  <span className="font-medium">Carbohidratos:</span> {((selectedFormula.carbohidratos || selectedFormula.carbohidratosPorPorcion || 0) * formData.cantPorcionesAportadas).toFixed(1)}g
                </div>
                <div>
                  <span className="font-medium">Sodio:</span> {((selectedFormula.sodio || selectedFormula.sodioPorPorcion || 0) * formData.cantPorcionesAportadas).toFixed(1)}mg
                </div>
                <div>
                  <span className="font-medium">Fibra:</span> {((selectedFormula.fibra || selectedFormula.fibraPorPorcion || 0) * formData.cantPorcionesAportadas).toFixed(1)}g
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFormula}
              className="px-4 py-2 bg-[#7c6a55] text-white rounded-md hover:bg-[#6b5847] 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Guardando...' : producto ? 'Actualizar' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};