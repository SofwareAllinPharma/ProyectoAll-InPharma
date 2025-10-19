import React from 'react';
import Modal from '../../../components/ui/modales/Modal';
import type { Formula } from '../types/formula.types';

export const ProtectedFormulaModal: React.FC<{ isOpen: boolean; onClose: () => void; onCreateCopy: (f: Formula) => void; formula: Formula | null }> = ({ isOpen, onClose, onCreateCopy, formula }) => {
  if (!isOpen || !formula) return null;

  return (
    <Modal open={isOpen} onClose={onClose} containerClass="bg-white rounded-xl p-6 shadow-xl max-w-lg w-full mx-4">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Fórmula Protegida</h2>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-700 mb-3">La fórmula <span className="font-semibold">"{formula.nombre}"</span> está protegida y no se puede modificar directamente.</p>
        <p className="text-gray-600">¿Deseas crear una nueva fórmula basada en esta fórmula protegida?</p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className={`
            px-4 py-2 rounded-lg 
            border border-gray-300 text-gray-700 
            hover:bg-gray-50 
            focus:ring-2 focus:ring-gray-300/50 focus:outline-none
            transition-all duration-200
          `}
        >
          Cancelar
        </button>

        <button
          onClick={() => onCreateCopy(formula)}
          className={`
            px-4 py-2 rounded-lg 
            bg-[#7c6a55] text-white 
            hover:bg-[#6b5847] 
            focus:ring-2 focus:ring-[#7c6a55]/50 focus:outline-none
            transition-all duration-200
            flex items-center gap-2
          `}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Crear copia
        </button>
      </div>
    </Modal>
  );
};