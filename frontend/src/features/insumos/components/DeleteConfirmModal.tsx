import { useEffect, useRef } from 'react';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import type { Insumo } from '../types/insumo.types';

export default function DeleteConfirmModal({ open, insumo, onConfirm, onCancel, loading = false }: {
  open: boolean; insumo: Insumo | null; onConfirm: (insumo: Insumo) => void; onCancel: () => void; loading?: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { if (open) cancelRef.current?.focus(); }, [open]);

  if (!open || !insumo) return null;
  return (
    <ConfirmDialog
      open={open}
      title="¿Eliminar insumo?"
      description={(
        <>
          <p className="text-gray-700 mb-2">Se eliminará el insumo <span className="font-medium">{insumo.nombre}</span></p>
          <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
        </>
      )}
      onConfirm={() => onConfirm(insumo)}
      onCancel={onCancel}
      loading={loading}
      footer={(
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
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
            onClick={() => onConfirm(insumo)}
            disabled={loading}
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
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      )}
    />
  );
}