import React, { useState, useEffect } from 'react';
import type { CreateFormulaRequest, FormulaInsumo, Formula } from '../types/formula.types';
import { FormulaInsumoManager } from './FormulaInsumoManager';
import { calculateNutrition, validateFormulaInsumos } from '../utils/nutritionCalculator';
import { NutritionDisplay } from './NutritionDisplay';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formula: CreateFormulaRequest) => void;
  formula?: Formula;
  isLoading?: boolean;
}

export const FormulaFormModalCompact: React.FC<Props> = ({ isOpen, onClose, onSubmit, formula, isLoading = false }) => {
  const [formData, setFormData] = useState({ nombre: '', porcionMinima: 100, esProtegida: false });
  const [formulaInsumos, setFormulaInsumos] = useState<FormulaInsumo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nutrition, setNutrition] = useState(calculateNutrition([]));

  useEffect(() => {
    if (formulaInsumos.length > 0) setNutrition(calculateNutrition(formulaInsumos, formData.porcionMinima));
  }, [formulaInsumos, formData.porcionMinima]);

  useEffect(() => {
    if (isOpen && formula) {
      setFormData({ nombre: formula.nombre, porcionMinima: formula.porcionMinima, esProtegida: formula.esProtegida });
      setFormulaInsumos(formula.insumos || []);
    } else if (isOpen) {
      setFormData({ nombre: '', porcionMinima: 100, esProtegida: false });
      setFormulaInsumos([]);
    }
    setErrors({});
  }, [isOpen, formula]);

  const validateAndSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es obligatorio';
    if (formData.porcionMinima <= 0) newErrors.porcionMinima = 'Porción debe ser mayor a 0';
    if (formulaInsumos.length === 0) newErrors.insumos = 'Debe agregar al menos un insumo';
    const insumosErrors = validateFormulaInsumos(formulaInsumos);
    if (insumosErrors.length > 0) newErrors.insumos = insumosErrors.join(', ');
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSubmit({ ...formData, insumos: formulaInsumos.map(fi => ({ idInsumo: fi.idInsumo, cantidadInsumo: fi.cantidadInsumo })) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#3e3529] mb-6 font-playfair">{formula ? 'Editar Fórmula' : 'Nueva Fórmula'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); validateAndSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-merriweather">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#7c6a55] ${errors.nombre ? 'border-red-500' : 'border-gray-300'} font-roboto`}
                placeholder="Nombre de la fórmula"
                disabled={isLoading}
              />
              {errors.nombre && <p className="mt-1 text-sm text-red-600 font-roboto">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-merriweather">Porción (g)</label>
              <input
                type="number"
                value={formData.porcionMinima}
                onChange={(e) => setFormData(prev => ({ ...prev, porcionMinima: parseInt(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#7c6a55] ${errors.porcionMinima ? 'border-red-500' : 'border-gray-300'} font-roboto`}
                min="1"
                disabled={isLoading}
              />
              {errors.porcionMinima && <p className="mt-1 text-sm text-red-600 font-roboto">{errors.porcionMinima}</p>}
            </div>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.esProtegida}
              onChange={(e) => setFormData(prev => ({ ...prev, esProtegida: e.target.checked }))}
              className="w-4 h-4 text-[#7c6a55] border-gray-300 rounded focus:ring-[#7c6a55]"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-gray-700 font-merriweather">Fórmula protegida</span>
          </label>
          <FormulaInsumoManager formulaInsumos={formulaInsumos} onChange={setFormulaInsumos} disabled={isLoading} />
          {errors.insumos && <p className="text-sm text-red-600 font-roboto">{errors.insumos}</p>}
          {formulaInsumos.length > 0 && <NutritionDisplay nutrition={nutrition} porcionMinima={formData.porcionMinima} />}
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-roboto" disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 bg-[#7c6a55] text-white rounded-md hover:bg-[#6b5847] disabled:opacity-50 font-roboto" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (formula ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};