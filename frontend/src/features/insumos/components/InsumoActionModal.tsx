import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Insumo } from '../types/insumo.types';

interface InsumoActionModalProps {
  open: boolean;
  insumo: Insumo | null;
  onEdit: (insumo: Insumo) => void;
  onDelete: (insumo: Insumo) => void;
  onCancel: () => void;
}

export default function InsumoActionModal({
  open,
  insumo,
  onEdit,
  onDelete,
  onCancel,
}: InsumoActionModalProps) {
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
    if (insumo) {
      onEdit(insumo);
    }
  };

  const handleDelete = () => {
    if (insumo) {
      onDelete(insumo);
    }
  };

  if (!open || !insumo) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center" 
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Acciones para insumo
          </h2>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Nombre:</span> {insumo.nombre}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">ID:</span> {insumo.id}
          </p>
        </div>

        <div className="space-y-3">
          <button
            ref={editRef}
            onClick={handleEdit}
            className="
              w-full px-4 py-3 rounded-lg 
              bg-[#5d5448] text-white 
              hover:bg-[#5d5448]/90 
              focus:ring-2 focus:ring-[#5d5448]/50 focus:outline-none
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Insumo
          </button>

          <button
            onClick={handleDelete}
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
            Eliminar Insumo
          </button>

          <button
            onClick={onCancel}
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
}