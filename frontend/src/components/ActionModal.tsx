import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ActionModalProps {
  open: boolean;
  name: string;
  title: string;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  editLabel?: string;
  deleteLabel?: string;
  cancelLabel?: string;
  children?: React.ReactNode;
}

export default function ActionModal({
  open,
  name,
  title,
  onEdit,
  onDelete,
  onCancel,
  editLabel = "Editar",
  deleteLabel = "Eliminar",
  cancelLabel = "Cancelar",
  children
}: ActionModalProps) {
  const [container] = useState(() => document.createElement("div"));
  const editRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      try { document.body.removeChild(container); } catch {}
    };
  }, [container]);

  useEffect(() => {
    if (!open) return;
    editRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center" onClick={onCancel}>
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Nombre:</span> {name}
          </p>
        </div>
        {children}
        <div className="space-y-3 mt-2">
          <button
            ref={editRef}
            onClick={onEdit}
            className="w-full px-4 py-3 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 focus:ring-2 focus:ring-[#5d5448]/50 focus:outline-none transition-all duration-200 flex items-center justify-center gap-2"
          >
            {editLabel}
          </button>
          <button
            onClick={onDelete}
            className="w-full px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500/50 focus:outline-none transition-all duration-200 flex items-center justify-center gap-2"
          >
            {deleteLabel}
          </button>
          <button
            onClick={onCancel}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300/50 focus:outline-none transition-all duration-200"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    container
  );
}
