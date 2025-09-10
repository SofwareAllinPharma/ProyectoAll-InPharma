import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={[
        "sticky top-0 z-50",
        "border-b border-white/30",
        "bg-white/40 backdrop-blur-md",
        scrolled ? "shadow-sm" : "",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-4 h-16 flex justify-between items-center text-[#5d5448]">
        <Link to="/" className="flex items-center gap-2.5 text-2xl font-bold whitespace-nowrap">
          <img
            src="/images/team/LogoCapsula.svg"  
            alt="All-In Pharma"
            className="h-8 w-8 flex-shrink-0"
          />
          <span>All-In Pharma</span>
        </Link>

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
      </div>
    </nav>
  );
}
