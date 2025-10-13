import React from 'react';
import type { Formula, CreateFormulaRequest } from '../types/formula.types';
import FormulaFormFields from './FormulaFormFields';
import FormulaFormFooter from './FormulaFormFooter';
import { useFormulaForm } from '../hooks/useFormulaForm';
import FormModal from '../../../components/ui/FormModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formula: CreateFormulaRequest) => void | Promise<void>;
  formula?: Formula | null;
  isLoading?: boolean;
  isCopyMode?: boolean;
}

export const FormulaFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, formula, isLoading = false, isCopyMode = false }) => {
  const formId = 'formula-form-full';
  const {
    formData,
    formulaInsumos,
    nutritionValues,
    errors,
    isSubmitting,
    handleInputChange,
    handleInsumosChange,
    handleSubmit,
  } = useFormulaForm({ formula: formula ?? null, isOpen, isCopyMode });

  if (!isOpen) return null;

  return (
    <FormModal open={isOpen} onClose={onClose} title={formula && !isCopyMode ? 'Editar Fórmula' : isCopyMode ? 'Crear Copia de Fórmula' : 'Agregar Nueva Fórmula'} formId={formId} loading={isLoading || isSubmitting} containerClass="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"><p className="text-red-600 text-sm font-roboto">{errors.general}</p></div>
      )}

      <form id={formId} onSubmit={(e) => { e.preventDefault(); void handleSubmit(onSubmit); }}>
        <FormulaFormFields formData={formData} onInputChange={handleInputChange} formulaInsumos={formulaInsumos} onInsumosChange={handleInsumosChange} errors={errors} isLoading={isLoading} nutritionValues={nutritionValues} />

        <FormulaFormFooter onClose={onClose} isLoading={isLoading || isSubmitting} submitLabel={formula && !isCopyMode ? 'Actualizar Fórmula' : 'Crear Fórmula'} />
      </form>
    </FormModal>
  );
};
