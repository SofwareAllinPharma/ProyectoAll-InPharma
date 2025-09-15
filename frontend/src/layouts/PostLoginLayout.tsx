import { Outlet } from "react-router-dom";
import NavbarPostLogin from "../components/Navbar";

export default function PostLoginLoyout() {
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
