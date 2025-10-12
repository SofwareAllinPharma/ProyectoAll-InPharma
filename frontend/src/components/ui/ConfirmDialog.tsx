import Modal from './Modal';
import React, { useRef, useEffect } from 'react';

export default function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
}: {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { if (open) cancelRef.current?.focus(); }, [open]);

  return (
    <Modal open={open} onClose={onCancel} containerClass="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4 transform -translate-y-8 min-h-[220px]">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {typeof description === 'string' ? (
            <p className="text-sm text-gray-600 mt-3">{description}</p>
          ) : (
            description
          )}
        </div>
      </div>

      <div className="mb-6">
        {/* espacio entre texto y botones */}
      </div>

      <div className="flex justify-end gap-3">
        <button ref={cancelRef} onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" disabled={loading}>{cancelLabel}</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 disabled:opacity-50" disabled={loading}>
          {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle></svg>}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
