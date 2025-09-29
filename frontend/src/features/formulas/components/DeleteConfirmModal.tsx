import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Formula } from '../types/formula.types';

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
  const [container] = useState(() => document.createElement("div"));
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      try { 
        document.body.removeChild(container); 
      } catch { 
        // Elemento ya eliminado
      }
    };
  }, [container]);

  useEffect(() => {
    if (!isOpen) return;
    
    cancelRef.current?.focus();
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !formula) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Confirmar Eliminación
          </h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            ¿Estás seguro de que deseas eliminar la fórmula?
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Fórmula:</span> {formula.nombre}
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="
              w-full px-4 py-3 rounded-lg 
              bg-red-600 text-white 
              hover:bg-red-700 
              focus:ring-2 focus:ring-red-500/50 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </button>

          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={isLoading}
            className="
              w-full px-4 py-3 rounded-lg 
              border border-gray-300 text-gray-700 
              hover:bg-gray-50 
              focus:ring-2 focus:ring-gray-300/50 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    container
  );
};
