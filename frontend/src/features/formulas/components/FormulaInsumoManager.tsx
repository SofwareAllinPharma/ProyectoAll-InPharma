import React, { useState, useEffect } from 'react';
import type { Insumo } from '../../insumos/types/insumo.types';
import type { FormulaInsumo } from '../types/formula.types';
import { InsumoService } from '../../insumos/services/insumo.service';

interface FormulaInsumoManagerProps {
  formulaInsumos: FormulaInsumo[];
  onChange: (insumos: FormulaInsumo[]) => void;
  disabled?: boolean;
}

export const FormulaInsumoManager: React.FC<FormulaInsumoManagerProps> = ({
  formulaInsumos,
  onChange,
  disabled = false,
}) => {
  const [availableInsumos, setAvailableInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInsumos();
  }, []);

  const loadInsumos = async () => {
    setLoading(true);
    try {
      const insumos = await InsumoService.getAllInsumos();
      setAvailableInsumos(insumos);
    } catch (error) {
      console.error('Error loading insumos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addInsumo = () => {
    const newInsumo: FormulaInsumo = {
      idFormula: 0,
      idInsumo: 0,
      cantidadInsumo: 0,
    };
    onChange([...formulaInsumos, newInsumo]);
  };

  const updateInsumo = (index: number, field: keyof FormulaInsumo, value: number) => {
    const updated = [...formulaInsumos];
    updated[index] = { ...updated[index], [field]: value };
    
    // Si se cambió el insumo, agregar la información completa
    if (field === 'idInsumo') {
      const selectedInsumo = availableInsumos.find(i => i.id === value);
      if (selectedInsumo) {
        updated[index].insumo = selectedInsumo;
      }
    }
    
    onChange(updated);
  };

  const removeInsumo = (index: number) => {
    const updated = formulaInsumos.filter((_, i) => i !== index);
    onChange(updated);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c6a55]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 font-merriweather">
          Insumos de la Fórmula
        </h3>
        <button
          type="button"
          onClick={addInsumo}
          disabled={disabled}
          className="text-sm bg-[#7c6a55] text-white px-3 py-1 rounded-md hover:bg-[#6b5847] 
                     disabled:opacity-50 disabled:cursor-not-allowed font-roboto transition-colors"
        >
          + Agregar Insumo
        </button>
      </div>

      {formulaInsumos.length === 0 ? (
        <div className="text-center py-8 text-gray-500 font-roboto">
          <p>No hay insumos agregados</p>
          <p className="text-sm">Haz clic en "Agregar Insumo" para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {formulaInsumos.map((formulaInsumo, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <select
                  value={formulaInsumo.idInsumo || ''}
                  onChange={(e) => updateInsumo(index, 'idInsumo', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                           focus:ring-2 focus:ring-[#7c6a55] disabled:bg-gray-100 font-roboto text-sm"
                >
                  <option value="">Seleccionar insumo</option>
                  {availableInsumos.map((insumo) => (
                    <option key={insumo.id} value={insumo.id}>
                      {insumo.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-32">
                <input
                  type="number"
                  value={formulaInsumo.cantidadInsumo || ''}
                  onChange={(e) => updateInsumo(index, 'cantidadInsumo', parseFloat(e.target.value) || 0)}
                  disabled={disabled}
                  placeholder="Cantidad (g)"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                           focus:ring-2 focus:ring-[#7c6a55] disabled:bg-gray-100 font-roboto text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => removeInsumo(index)}
                disabled={disabled}
                className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 
                         disabled:cursor-not-allowed transition-colors"
                title="Eliminar insumo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {formulaInsumos.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-roboto">
            <span className="font-medium">Peso total:</span>{' '}
            {formulaInsumos.reduce((total, fi) => total + (fi.cantidadInsumo || 0), 0).toFixed(1)}g
          </p>
        </div>
      )}
    </div>
  );
};