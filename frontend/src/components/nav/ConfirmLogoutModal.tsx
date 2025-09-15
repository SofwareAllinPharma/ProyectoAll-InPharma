import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ConfirmLogoutModal({
    open,
    onCancel,
    onConfirm,
}: {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const [container] = useState(() => document.createElement("div"));
    const cancelRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        document.body.appendChild(container);
        return () => {
            try { document.body.removeChild(container); } catch { }
        };
    }, [container]);

    useEffect(() => {
        if (!open) return;
        cancelRef.current?.focus();
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onCancel]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] bg-black/50 flex items-start justify-center" onClick={onCancel}>
            <div className="mt-32 bg-white rounded-xl p-6 shadow-lg max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-4">¿Seguro que quiere cerrar sesión?</h2>
                <div className="flex justify-end gap-3">
                    <button
                        ref={cancelRef}
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition"
                    >
                        Sí, salir
                    </button>
                </div>
            </div>
        </div>,
        container
    );
}
