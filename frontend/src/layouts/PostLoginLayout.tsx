import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import NavbarPostLogin from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import type { SidebarItem } from "../components/Sidebar";
import {
  FaThLarge,
  FaBoxOpen,
  FaClipboardList,
  FaFlask,
  FaUsers,
  FaCog,
  FaTruck,
  FaWarehouse,
} from "react-icons/fa";

export default function PostLoginLoyout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean | undefined>(
    undefined
  );

  const getItemsForPath = (pathname: string): SidebarItem[] => {
    if (pathname.startsWith("/adminsis")) {
      return [
        {
          id: "resumen",
          label: "Resumen",
          to: "/adminsis",
          icon: <FaThLarge />,
        },
        {
          id: "insumos",
          label: "Insumos",
          to: "/adminsis/insumos",
          icon: <FaBoxOpen />,
        },
        {
          id: "formulas",
          label: "Fórmulas",
          to: "/adminsis/formulas",
          icon: <FaFlask />,
        },
        {
          id: "depositos",
          label: "Depósitos",
          to: "/adminsis/depositos",
          icon: <FaWarehouse />,
        },
        {
          id: "productos",
          label: "Productos",
          to: "/adminsis/productos",
          icon: <FaClipboardList />,
        },
        {
          id: "pedidos",
          label: "Pedidos",
          to: "/adminsis/pedidos",
          icon: <FaTruck />,
        },
        {
          id: "usuarios",
          label: "Usuarios",
          to: "/adminsis/usuarios",
          icon: <FaUsers />,
        },
        {
          id: "configuracion",
          label: "Configuración",
          to: "/adminsis/configuracion",
          icon: <FaCog />,
        },
      ];
    }
    if (pathname.startsWith("/tecnico")) {
      return [
        { id: "operaciones", label: "Operaciones", to: "/tecnico" },
        { id: "pedidos", label: "Pedidos", to: "/tecnico/pedidos" },
        { id: "depositos", label: "Depósitos", to: "/tecnico/depositos" },
        {
          id: "mantenimiento",
          label: "Mantenimiento",
          to: "/tecnico/mantenimiento",
        },
        { id: "reportes", label: "Reportes", to: "/tecnico/reportes" },
      ];
    }
    if (pathname.startsWith("/adminfab")) {
      return [
        { id: "pedidos", label: "Pedidos", to: "/adminfab/pedidos" },
        { id: "depositos", label: "Depósitos", to: "/adminfab/depositos" },
        { id: "stock", label: "Stock", to: "/adminfab/stock" },
        { id: "mostrador", label: "Mostrador", to: "/adminfab/mostrador" },
      ];
    }

    // Default: empty
    return [];
  };

  const items = getItemsForPath(location.pathname);
  const pathname = location.pathname;
  const isDashboard =
    pathname.startsWith("/adminsis") ||
    pathname.startsWith("/adminfab") ||
    pathname.startsWith("/tecnico");

  useEffect(() => {
    if (isDashboard) setSidebarCollapsed(undefined);
  }, [isDashboard]);

  console.log(
    "[PostLoginLayout] pathname=",
    location.pathname,
    "isDashboard=",
    isDashboard,
    "items=",
    items.length,
    "itemsIds=",
    items.map((it) => it.id ?? it.label),
    "sidebarCollapsed=",
    sidebarCollapsed
  );

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#5d5448]">
      <NavbarPostLogin
        {...(!isDashboard && !pathname.startsWith("/perfiles")
          ? {
              onMenuToggle: () =>
                setSidebarCollapsed((s) => (s === undefined ? false : !s)),
            }
          : {})}
      />

      <div className="flex">
        {isDashboard && (
          <Sidebar
            title="Panel"
            items={items}
            onItemClick={() => {}}
            collapsedControlled={sidebarCollapsed}
            onToggleCollapsed={(next) => setSidebarCollapsed(next)}
          />
        )}
        <main className="flex-1 overflow-x-hidden">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
