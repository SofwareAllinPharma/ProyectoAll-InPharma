import React from 'react';

export default function FormulaFormFooter({
  onClose,
  isLoading,
  submitLabel = 'Guardar',
}: {
  onClose: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="flex justify-end space-x-3 mt-8">
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-roboto"
        disabled={isLoading}
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2 bg-[#7c6a55] text-white rounded-md hover:bg-[#6b5847] disabled:opacity-50 disabled:cursor-not-allowed font-roboto"
      >
        {isLoading ? 'Guardando...' : submitLabel}
      </button>
    </div>
  );
}
