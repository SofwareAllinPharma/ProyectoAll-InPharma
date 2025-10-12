import React from 'react';
import type { FormulaInsumo, NutritionCalculation } from '../types/formula.types';
import { FormulaInsumoManager } from './FormulaInsumoManager';
import { NutritionDisplay } from './NutritionDisplay';

export default function FormulaFormFields({
  formData,
  onInputChange,
  formulaInsumos,
  onInsumosChange,
  errors,
  isLoading,
  nutritionValues,
}: {
  formData: { nombre: string; porcionMinima: number; esProtegida: boolean };
  onInputChange: (field: string, value: any) => void;
  formulaInsumos: FormulaInsumo[];
  onInsumosChange: (insumos: FormulaInsumo[]) => void;
  errors: Record<string, string>;
  isLoading?: boolean;
  nutritionValues: NutritionCalculation;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Fórmula</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => onInputChange('nombre', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ingrese el nombre de la fórmula"
            disabled={isLoading}
          />
          {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Porción Mínima (g)</label>
          <input
            type="number"
            value={formData.porcionMinima}
            onChange={(e) => onInputChange('porcionMinima', parseInt(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] ${errors.porcionMinima ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="100"
            min="1"
            disabled={isLoading}
          />
          {errors.porcionMinima && <p className="mt-1 text-sm text-red-600">{errors.porcionMinima}</p>}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.esProtegida}
            onChange={(e) => onInputChange('esProtegida', e.target.checked)}
            className="w-4 h-4 text-[#7c6a55] border-gray-300 rounded focus:ring-[#7c6a55]"
            disabled={isLoading}
          />
          <span className="text-sm font-medium text-gray-700">Fórmula Protegida</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">Las fórmulas protegidas no pueden ser editadas directamente</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[#3e3529] mb-4">Composición de Insumos</h3>
        <FormulaInsumoManager formulaInsumos={formulaInsumos} onChange={onInsumosChange} disabled={isLoading} />
        {errors.insumos && <p className="mt-2 text-sm text-red-600">{errors.insumos}</p>}
      </div>

      {formulaInsumos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#3e3529] mb-4">Información Nutricional por Porción ({formData.porcionMinima}g)</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <NutritionDisplay nutrition={nutritionValues} porcionMinima={formData.porcionMinima} />
          </div>
        </div>
      )}
    </div>
  );
}
