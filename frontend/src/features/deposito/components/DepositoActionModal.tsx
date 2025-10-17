import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Deposito } from '../types/deposito.types';
import DeleteConfirmModal from './DeleteConfirmModal';
import ConfigurarUmbralesModal from '../../inventario/components/ConfigurarUmbralesModal';


interface DepositoActionModalProps {
  open: boolean;
  deposito: Deposito | null;
  onEdit: (deposito: Deposito) => void;
  onDeactivate: (deposito: Deposito) => void;
  onCancel: () => void;
  onUmbralesSuccess?: () => void;
}

export default function DepositoActionModal({
  open,
  deposito,
  onEdit,
  onDeactivate,
  onCancel,
  onUmbralesSuccess,
}: DepositoActionModalProps) {
  const [showUmbrales, setShowUmbrales] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [container] = useState(() => document.createElement("div"));
  const editRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      try {
        document.body.removeChild(container);
      } catch {
      }
    };
  }, [container]);

  useEffect(() => {
    if (!open) return;
    editRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);


  const handleEdit = () => {
    if (deposito) {
      onEdit(deposito);
    }
  };

  const handleConfigUmbrales = () => {
    setShowUmbrales(true);
  };

  const handleDeactivate = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = (dep: Deposito) => {
    setShowDeleteConfirm(false);
    onDeactivate(dep);
  };

  if (!open || !deposito) return null;

  // Si se está configurando umbrales, mostrar solo ese modal
  if (showUmbrales) {
    return (
      <ConfigurarUmbralesModal
        open={showUmbrales}
        depositName={deposito.nombre}
        depositoId={deposito.id}
        onClose={() => setShowUmbrales(false)}
        onSuccess={() => {
          setShowUmbrales(false);
          if (typeof onUmbralesSuccess === 'function') onUmbralesSuccess();
        }}
      />
    );
  }

  // Si no, mostrar el modal de acciones
  return (
    <>
      {createPortal(
        <div
          className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center"
          onClick={onCancel}
        >
          <div
            className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Acciones para depósito
              </h2>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Nombre:</span> {deposito.nombre}
              </p>
            </div>
            <div className="space-y-3">
              <button
                ref={editRef}
                onClick={handleEdit}
                className="w-full px-4 py-3 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 focus:ring-2 focus:ring-[#5d5448]/50 focus:outline-none transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modificar depósito
              </button>
              <button
                onClick={handleConfigUmbrales}
                className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Configurar umbrales
              </button>
              <button
                onClick={handleDeactivate}
                className="w-full px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500/50 focus:outline-none transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar depósito
              </button>
              <button
                onClick={onCancel}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300/50 focus:outline-none transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        container
      )}
      <DeleteConfirmModal
        open={showDeleteConfirm}
        deposito={deposito}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}