import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PreLoginLoyout() {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#5d5448]">
      <Navbar />
      <main>
        {/* Aquí se renderizan las páginas hijas de este layout */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
