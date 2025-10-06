import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Deposito } from '../types/deposito.types';

interface DeleteConfirmModalProps {
  open: boolean;
  deposito: Deposito | null;
  onConfirm: (deposito: Deposito) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  open,
  deposito,
  onConfirm,
  onCancel,
  loading = false
}: DeleteConfirmModalProps) {
  const [container] = useState(() => document.createElement("div"));
  const cancelRef = useRef<HTMLButtonElement | null>(null);

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
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  const handleConfirm = () => {
    if (deposito) {
      onConfirm(deposito);
    }
  };

  if (!open || !deposito) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center" 
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              ¿Eliminar depósito?
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm">
            <p><span className="font-medium text-gray-700">Nombre:</span> {deposito.nombre}</p>
            <p className="text-xs text-gray-500 mt-2">
              Para eliminar el depósito, la capacidad usada debe 
              ser igual a 0 y no debe tener movimientos pendientes.
            </p> {/* sin implementacion aun */}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="
              px-4 py-2 rounded-lg 
              border border-gray-300 text-gray-700 
              hover:bg-gray-50 
              focus:ring-2 focus:ring-gray-300/50 focus:outline-none
              transition-all duration-200
            "
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="
              px-4 py-2 rounded-lg 
              bg-red-600 text-white 
              hover:bg-red-700 
              focus:ring-2 focus:ring-red-500/50 focus:outline-none
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
            disabled={loading}
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>,
    container
  );
}