import Modal from './Modal';
import React, { useRef, useEffect } from 'react';

export default function FormModal({
  open,
  onClose,
  title,
  description,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  loading = false,
  footer,
  children,
  containerClass = 'bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[95vh] overflow-y-auto border border-gray-200',
  formId,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
  containerClass?: string;
  formId?: string;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { if (open) cancelRef.current?.focus(); }, [open]);

  return (
    <Modal open={open} onClose={onClose} containerClass={containerClass}>
      <div className="flex flex-col h-full p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {description}
        </div>

        <div className="flex-1 overflow-auto">
          {children}
        </div>

        <div className="mt-auto">
          {footer ? (
            footer
          ) : (
            <div className="flex justify-end gap-3">
              <button ref={cancelRef} onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" disabled={loading}>{cancelLabel}</button>
              <button form={formId} type="submit" className="px-4 py-2 rounded-lg bg-[#7c6a55] text-white hover:bg-[#6b5847] flex items-center gap-2 disabled:opacity-50" disabled={loading}>
                {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle></svg>}
                {submitLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
