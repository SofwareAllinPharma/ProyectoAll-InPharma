import { Link } from "react-router-dom";

function GhostLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="border border-[#5d5448] px-4 py-2 rounded-lg hover:bg-[#5d5448] hover:text-white transition"
    >
      {children}
    </Link>
  );
}

function GhostButton({
  children,
  onClick,
  to,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
}) {
  if (to) {
    return (
      <Link
        to={to}
        className="px-4 py-2 rounded-lg border border-[#5d5448] text-[#5d5448] bg-white hover:bg-[#5d5448]/10 transition inline-block"
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg border border-[#5d5448] text-[#5d5448] bg-white hover:bg-[#5d5448]/10 transition"
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition"
    >
      {children}
    </button>
  );
}

export default function NavbarButtons({
  variant,
  onLogoutClick,
}: {
  variant:
    | "landing-root"
    | "landing-inner"
    | "login"
    | "profiles-root"
    | "profiles-item"
    | "dashboard";
  onLogoutClick: () => void;
}) {
  // Map variants to exact button sets requested by the user:
  // - landing-root: '¿Quiénes somos?' and 'Iniciar Sesión'
  // - landing-inner (e.g. /quienes-somos): 'Inicio' and 'Iniciar Sesión'
  // - login: '¿Quiénes somos?' and 'Inicio'
  // - profiles-root (/perfiles): 'Salir'
  // - profiles-item (/perfiles/:id): 'Perfiles' and 'Salir'
  // - dashboard/other: 'Perfiles' and 'Salir'

  if (variant === "landing-root") {
    return (
      <div className="flex items-center gap-6">
        <GhostLink to="/quienes-somos">¿Quiénes somos?</GhostLink>
        <GhostLink to="/auth/login">Iniciar Sesión</GhostLink>
      </div>
    );
  }

  if (variant === "landing-inner") {
    return (
      <div className="flex items-center gap-6">
        <GhostLink to="/">Inicio</GhostLink>
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

  if (variant === "profiles-root") {
    return (
      <div className="flex items-center gap-6">
        <PrimaryButton onClick={onLogoutClick}>Salir</PrimaryButton>
      </div>
    );
  }

  // profiles-item and dashboard
  // Mostrar acceso rápido a Pedidos cuando estemos en dashboard (mejor UX si el sidebar no aparece)
  const perfil = localStorage.getItem("userPerfil");
  let pedidosPath: string | undefined;
  if (perfil === "1") pedidosPath = "/tecnico/pedidos";
  else if (perfil === "2") pedidosPath = "/adminfab/pedidos";
  else if (perfil === "3") pedidosPath = "/adminsis/pedidos";

  return (
    <div className="flex items-center gap-3">
      {pedidosPath ? <GhostButton to={pedidosPath}>Pedidos</GhostButton> : null}
      <GhostButton to="/perfiles">Perfiles</GhostButton>
      <PrimaryButton onClick={onLogoutClick}>Salir</PrimaryButton>
    </div>
  );
}
