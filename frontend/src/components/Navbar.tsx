import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ConfirmLogoutModal from "./nav/ConfirmLogoutModal";
import NavbarButtons from "./nav/NavbarButtons";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const path = location.pathname;
  let variant: "landing" | "login" | "profiles" | "dashboard" = "landing";
  if (path === "/" || path.startsWith("/quienes-somos")) variant = "landing";
  else if (path.startsWith("/auth/login")) variant = "login";
  else if (path.startsWith("/perfiles")) variant = "profiles";
  else if (path.startsWith("/tecnico") || path.startsWith("/adminfab") || path.startsWith("/adminsis")) variant = "dashboard";

  const handleLogout = () => {
    setShowConfirm(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      <nav
        className={[
          "sticky top-0 z-[9999]",
          "bg-white/80 backdrop-blur",
          "border-b border-[#5d5448]/20",
          scrolled ? "shadow-sm" : "",
        ].join(" ")}
      >
        {/* 👇 contenedor fluido, sin centrado fijo */}
        <div className="h-16 flex items-center justify-between text-[#5d5448] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/team/LogoCapsula.svg" alt="All-In Pharma" className="h-8 w-8 flex-shrink-0" />
            <span>All-In Pharma</span>
          </Link>

          <NavbarButtons
            variant={variant}
            onLogoutClick={() => setShowConfirm(true)}
          />
        </div>
      </nav>

      <ConfirmLogoutModal
        open={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
