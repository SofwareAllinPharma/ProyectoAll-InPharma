import React, { useEffect, useRef } from 'react';
import type { Formula } from '../../types/formula.types';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formula: Formula | null;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  formula,
  isLoading = false,
}) => {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen) cancelRef.current?.focus();
  }, [isOpen]);

  if (!isOpen || !formula) return null;

  return (
    <ConfirmDialog
      open={isOpen}
      title="¿Eliminar fórmula?"
      description={(
        <>
          <p className="text-gray-700 mb-2">Se eliminará la fórmula <span className="font-medium">{formula.nombre}</span></p>
          <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
        </>
      )}
      onConfirm={onConfirm}
      onCancel={onClose}
      loading={isLoading}
      footer={(
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-lg 
              border border-gray-300 text-gray-700 
              hover:bg-gray-50 
              focus:ring-2 focus:ring-gray-300/50 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-lg 
              bg-red-600 text-white 
              hover:bg-red-700 
              focus:ring-2 focus:ring-red-500/50 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center gap-2
            `}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      )}
    />
  );
};
