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
  containerClass = 'bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[95vh] flex flex-col',
  submitDisabled = false,
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
  submitDisabled?: boolean;
  formId?: string;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { if (open) cancelRef.current?.focus(); }, [open]);

  return (
    <Modal open={open} onClose={onClose} containerClass={containerClass}>
      <div className="bg-[#5d5448] text-white rounded-t-xl px-6 py-4 flex-none">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <div className="p-6 flex-1 overflow-auto min-h-0">
        {description}
        {children}
      </div>

      <div className="px-6 py-4 bg-white rounded-b-xl flex-none">
        {footer ? (
          footer
        ) : (
          <div className="flex justify-end gap-3">
            <button ref={cancelRef} onClick={onClose} className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" disabled={loading}>{cancelLabel}</button>
            <button form={formId} type="submit" className="px-6 py-3 rounded-lg bg-[#5d5448] text-white hover:bg-[#50453d] flex items-center gap-2 disabled:opacity-50" disabled={loading || submitDisabled}>
              {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle></svg>}
              {submitLabel}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
