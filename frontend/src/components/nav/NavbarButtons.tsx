import { Link } from "react-router-dom";

export default function NavbarButtons({
    variant,
    onLogoutClick,
}: {
    variant: "landing" | "login" | "profiles" | "dashboard";
    onLogoutClick: () => void;
}) {
    if (variant === "landing") {
        return (
            <div className="flex items-center gap-6">
                <Link
                    to="/quienes-somos"
                    className="border border-[#5d5448] px-4 py-2 rounded-lg hover:bg-[#5d5448] hover:text-white transition"
                >
                    ¿Quiénes somos?
                </Link>
                <Link
                    to="/auth/login"
                    className="border border-[#5d5448] px-4 py-2 rounded-lg hover:bg-[#5d5448] hover:text-white transition"
                >
                    Iniciar Sesión
                </Link>
            </div>
        );
    }

    if (variant === "login") {
        return (
            <div className="flex items-center gap-6">
                <Link
                    to="/quienes-somos"
                    className="border border-[#5d5448] px-4 py-2 rounded-lg hover:bg-[#5d5448] hover:text-white transition"
                >
                    ¿Quiénes somos?
                </Link>
                <Link
                    to="/"
                    className="border border-[#5d5448] px-4 py-2 rounded-lg hover:bg-[#5d5448] hover:text-white transition"
                >
                    Inicio
                </Link>
            </div>
        );
    }

    if (variant === "profiles") {
        return (
            <div className="flex items-center gap-6">
                <button
                    onClick={onLogoutClick}
                    className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition"
                >
                    Salir
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-6">
            <Link
                to="/perfiles"
                className="px-4 py-2 rounded-lg border border-[#5d5448] text-[#5d5448] bg-white hover:bg-[#5d5448]/10 transition"
            >
                Perfiles
            </Link>
            <button
                onClick={onLogoutClick}
                className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition"
            >
                Salir
            </button>
        </div>
    );
}
