import React from 'react';
import type { Formula, CreateFormulaRequest } from '../types/formula.types';
import { useFormulaForm } from '../hooks/useFormulaForm';
import FormModal from '../../../components/ui/FormModal';
import { FormulaInsumoManager } from './FormulaInsumoManager';
import { NutritionDisplay } from './NutritionDisplay';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formula: CreateFormulaRequest) => void | Promise<void>;
  formula?: Formula;
  isLoading?: boolean;
}

export const FormulaFormModalCompact: React.FC<Props> = ({ isOpen, onClose, onSubmit, formula, isLoading = false }) => {
  const formId = 'formula-form-compact';
  const { formData, formulaInsumos, nutritionValues, errors, isSubmitting, handleInputChange, handleInsumosChange, handleSubmit } = useFormulaForm({ formula: formula ?? null, isOpen });

  if (!isOpen) return null;

  return (
    <FormModal open={isOpen} onClose={onClose} title={formula ? 'Editar Fórmula' : 'Nueva Fórmula'} formId={formId} loading={isLoading || isSubmitting} containerClass="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-[#3e3529] mb-6 font-playfair">{formula ? 'Editar Fórmula' : 'Nueva Fórmula'}</h2>

      <form id={formId} onSubmit={(e) => { e.preventDefault(); void handleSubmit(onSubmit); }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-merriweather">Nombre</label>
            <input type="text" value={formData.nombre} onChange={(e) => handleInputChange('nombre', e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#7c6a55] ${errors.nombre ? 'border-red-500' : 'border-gray-300'} font-roboto`} placeholder="Nombre de la fórmula" disabled={isLoading || isSubmitting} />
            {errors.nombre && <p className="mt-1 text-sm text-red-600 font-roboto">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-merriweather">Porción (g)</label>
            <input type="number" value={formData.porcionMinima} onChange={(e) => handleInputChange('porcionMinima', parseInt(e.target.value) || 0)} className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#7c6a55] ${errors.porcionMinima ? 'border-red-500' : 'border-gray-300'} font-roboto`} min={1} disabled={isLoading || isSubmitting} />
            {errors.porcionMinima && <p className="mt-1 text-sm text-red-600 font-roboto">{errors.porcionMinima}</p>}
          </div>
        </div>

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={formData.esProtegida} onChange={(e) => handleInputChange('esProtegida', e.target.checked)} className="w-4 h-4 text-[#7c6a55] border-gray-300 rounded focus:ring-[#7c6a55]" disabled={isLoading || isSubmitting} />
          <span className="text-sm font-medium text-gray-700 font-merriweather">Fórmula protegida</span>
        </label>

        <FormulaInsumoManager formulaInsumos={formulaInsumos} onChange={handleInsumosChange} disabled={isLoading || isSubmitting} />
        {errors.insumos && <p className="text-sm text-red-600 font-roboto">{errors.insumos}</p>}

        {formulaInsumos.length > 0 && <NutritionDisplay nutrition={nutritionValues} porcionMinima={formData.porcionMinima} />}

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-roboto" disabled={isLoading || isSubmitting}>Cancelar</button>
          <button type="submit" className="px-6 py-2 bg-[#7c6a55] text-white rounded-md hover:bg-[#6b5847] disabled:opacity-50 font-roboto" disabled={isLoading || isSubmitting}>{isLoading || isSubmitting ? 'Guardando...' : (formula ? 'Actualizar' : 'Crear')}</button>
        </div>
      </form>
    </FormModal>
  );
};