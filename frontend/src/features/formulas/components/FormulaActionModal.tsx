import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Formula } from '../types/formula.types';

interface FormulaActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formula: Formula | null;
}

export const FormulaActionModal: React.FC<FormulaActionModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  formula,
}) => {
  const [container] = useState(() => document.createElement("div"));
  const editRef = useRef<HTMLButtonElement | null>(null);

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
    
    editRef.current?.focus();
    
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
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Seleccionar Acción
          </h2>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Fórmula:</span> {formula.nombre}
          </p>
          <p className="text-sm text-gray-600">
            {formula.esProtegida ? 'Fórmula protegida' : 'Fórmula no protegida'}
          </p>
        </div>

        <div className="space-y-3">
          <button
            ref={editRef}
            onClick={onEdit}
            className="
              w-full px-4 py-3 rounded-lg 
              bg-[#7c6a55] text-white 
              hover:bg-[#6b5847] 
              focus:ring-2 focus:ring-[#7c6a55]/50 focus:outline-none
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          
          <button
            onClick={onDelete}
            className="
              w-full px-4 py-3 rounded-lg 
              bg-red-600 text-white 
              hover:bg-red-700 
              focus:ring-2 focus:ring-red-500/50 focus:outline-none
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>

          <button
            onClick={onClose}
            className="
              w-full px-4 py-3 rounded-lg 
              border border-gray-300 text-gray-700 
              hover:bg-gray-50 
              focus:ring-2 focus:ring-gray-300/50 focus:outline-none
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
