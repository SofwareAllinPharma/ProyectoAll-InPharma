import React from 'react';
import Modal from '../modales/Modal';

export type GlobalSnackProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  duration?: number; // ms
};

export default function GlobalSnack({ open, onClose, title, message, duration = 4000 }: GlobalSnackProps) {
  // auto-close timer
  React.useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(id);
  }, [open, onClose, duration]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      backdropClassName="bg-black/50 backdrop-blur-sm"
      className="z-[12000]"
      containerClass="w-[90%] max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-6 sm:p-8"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="h-10 w-10 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172l-3.293-3.293A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z"/></svg>
        </div>
        {title && <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h3>}
        <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{message}</p>
        <button onClick={onClose} className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 focus:outline-none focus:ring-2 focus:ring-[#5d5448]/40">
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
