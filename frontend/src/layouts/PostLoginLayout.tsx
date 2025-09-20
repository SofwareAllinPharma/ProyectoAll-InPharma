
//Con esto, si el token caduca o es inválido, te redirige a /auth/login

import { Outlet, useNavigate } from "react-router-dom";
import NavbarPostLogin from "../components/Navbar";
import { useEffect, useState } from "react";
import { apiFetch, getToken } from "../lib/api";



export default function PostLoginLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      navigate("/auth/login", { replace: true });
      return;
    }

    apiFetch("/auth/me")
      .then(() => setReady(true))
      .catch(() => navigate("/auth/login", { replace: true }));
  }, [navigate]);

  if (!ready) return null; // Puedes poner un spinner aquí si quieres

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#5d5448]">
      {/* Navbar específico post-login (estilo igual a landing) */}
      <NavbarPostLogin />

      {/* Contenido */}
      <main className="mx-auto max-w-7xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
