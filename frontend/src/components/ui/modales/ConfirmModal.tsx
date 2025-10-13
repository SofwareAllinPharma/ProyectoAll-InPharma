import React, { useState } from 'react';
import Modal from './Modal';

export default function ConfirmModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}: {
  open: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => Promise<any> | void;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <div className="flex flex-col min-h-[120px]">
        <div>
          <h2 className="text-lg font-semibold mb-4">{title ?? '¿Confirmar?'}</h2>
          {description && <div className="mb-4 text-sm text-gray-600">{description}</div>}
        </div>

        <div className="mt-auto flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition">
            {cancelLabel}
          </button>
          <button onClick={handleConfirm} disabled={loading} className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition">
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
