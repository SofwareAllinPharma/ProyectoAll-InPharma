import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function ConfirmLogoutModal({
    open,
    onCancel,
    onConfirm,
}: {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const [container] = useState(() => {
        const el = document.createElement("div");
        return el;
    });

    const cancelRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        document.body.appendChild(container);
        return () => {
            document.body.removeChild(container);
        };
    }, [container]);

    useEffect(() => {
        if (!open) return;
        cancelRef.current?.focus();
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onCancel]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] bg-black/50 flex justify-center items-start"
            onClick={onCancel}
        >
            <div
                className="mt-32 self-start bg-white rounded-xl p-6 shadow-lg max-w-sm w-full mx-4 max-h-[85vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4">
                    ¿Seguro que quiere cerrar sesión?
                </h2>
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

export default function NavbarPostLogin() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);

    const isOnProfilesPage = location.pathname === "/perfiles";

    const handleLogout = () => {
        navigate("/", { replace: true });
    };

    return (
        <>
            <header className="sticky top-0 z-30 bg-[#f5f1e8]/80 backdrop-blur border-b border-[#5d5448]/20">
                <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="/images/team/LogoCapsula.svg"
                            alt="All-In Pharma"
                            className="h-10 w-auto"
                        />
                        <span className="font-bold text-xl tracking-tight">
                            All-In Pharma
                        </span>
                    </Link>

                    <nav className="flex items-center gap-3">
                        {!isOnProfilesPage && (
                            <Link
                                to="/perfiles"
                                className="px-4 py-2 rounded-lg text-base font-medium transition border border-[#5d5448] text-[#5d5448] bg-[#f5f1e8] hover:bg-[#5d5448]/10"
                            >
                                Perfiles
                            </Link>
                        )}
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="px-4 py-2 rounded-lg bg-[#5d5448] text-white text-base font-medium hover:bg-[#5d5448]/90 transition"
                        >
                            Salir
                        </button>
                    </nav>
                </div>
            </header>

            <ConfirmLogoutModal
                open={showConfirm}
                onCancel={() => setShowConfirm(false)}
                onConfirm={handleLogout}
            />
        </>
    );
}
