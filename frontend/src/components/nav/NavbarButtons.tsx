import { Link } from "react-router-dom";

function GhostLink({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <Link to={to} className="border border-[#5d5448] px-4 py-2 rounded-lg hover:bg-[#5d5448] hover:text-white transition">
            {children}
        </Link>
    );
}

function GhostButton({ children, onClick, to }: { children: React.ReactNode; onClick?: () => void; to?: string }) {
    if (to) {
        return (
            <Link to={to} className="px-4 py-2 rounded-lg border border-[#5d5448] text-[#5d5448] bg-white hover:bg-[#5d5448]/10 transition inline-block">
                {children}
            </Link>
        );
    }
    return (
        <button onClick={onClick} className="px-4 py-2 rounded-lg border border-[#5d5448] text-[#5d5448] bg-white hover:bg-[#5d5448]/10 transition">
            {children}
        </button>
    );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    return (
        <button onClick={onClick} className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition">
            {children}
        </button>
    );
}

export default function NavbarButtons({ variant, onLogoutClick }: { variant: "landing" | "login" | "profiles" | "dashboard"; onLogoutClick: () => void; }) {
    if (variant === "landing") {
        return (
            <div className="flex items-center gap-6">
                <GhostLink to="/quienes-somos">¿Quiénes somos?</GhostLink>
                <GhostLink to="/auth/login">Iniciar Sesión</GhostLink>
            </div>
        );
    }

    if (variant === "login") {
        return (
            <div className="flex items-center gap-6">
                <GhostLink to="/quienes-somos">¿Quiénes somos?</GhostLink>
                <GhostLink to="/">Inicio</GhostLink>
            </div>
        );
    }

    if (variant === "profiles") {
        return (
            <div className="flex items-center gap-6">
                <PrimaryButton onClick={onLogoutClick}>Salir</PrimaryButton>
            </div>
        );
    }

        return (
                <div className="flex items-center gap-6">
                                    {/* mobile menu shown in Navbar */}
                    <GhostButton to="/perfiles">Perfiles</GhostButton>
                    <PrimaryButton onClick={onLogoutClick}>Salir</PrimaryButton>
                </div>
            );
}
