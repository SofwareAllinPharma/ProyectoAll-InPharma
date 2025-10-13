import React from 'react';
import Modal from '../../../components/ui/Modal';
import ModalHeader from '../../../components/ui/ModalHeader';
import ModalFooter from '../../../components/ui/ModalFooter';
import type { Formula } from '../types/formula.types';

export const ProtectedFormulaModal: React.FC<{ isOpen: boolean; onClose: () => void; onCreateCopy: () => void; formula: Formula | null }> = ({ isOpen, onClose, onCreateCopy, formula }) => {
  if (!isOpen || !formula) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Fórmula Protegida</h2>
        </div>
      </ModalHeader>

      <div className="px-6 py-4">
        <p className="text-gray-700 mb-3">La fórmula <span className="font-semibold">"{formula.nombre}"</span> está protegida y no se puede modificar directamente.</p>
        <p className="text-gray-600">¿Deseas crear una nueva fórmula basada en esta fórmula protegida?</p>
      </div>

      <ModalFooter>
        <div className="space-y-3">
          <button onClick={onCreateCopy} className="w-full px-4 py-3 rounded-lg bg-[#7c6a55] text-white hover:bg-[#6b5847] focus:ring-2 focus:ring-[#7c6a55]/50">
            <svg className="h-4 w-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Sí, crear copia
          </button>

          <button onClick={onClose} className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
