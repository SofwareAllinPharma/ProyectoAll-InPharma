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
  FaWarehouse,
  FaBox,
  FaTruck,
} from "react-icons/fa";

export default function PostLoginLoyout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean | undefined>(
    undefined
  );

  const getItemsForPath = (pathname: string): SidebarItem[] => {
      if (pathname.startsWith('/adminsis')) {
      return [
        { id: 'resumen', label: 'Resumen', to: '/adminsis', icon: <FaThLarge /> },
        { id: 'insumos', label: 'Insumos', to: '/adminsis/insumos', icon: <FaBoxOpen /> },
        { id: 'formulas', label: 'Fórmulas', to: '/adminsis/formulas', icon: <FaFlask /> },
        { id: 'productos', label: 'Productos', to: '/adminsis/productos', icon: <FaBox /> },
        { id: 'pedidos', label: 'Pedidos', to: '/adminsis/pedidos', icon: <FaClipboardList /> },
        { id: 'depositos', label: 'Depósitos', to: '/adminsis/depositos', icon: <FaWarehouse /> },
  // TODO_RECUPERAR: ocultado temporalmente hasta completar la configuración de usuarios
  // { id: 'usuarios', label: 'Usuarios', to: '/adminsis/usuarios', icon: <FaUsers /> },
  // TODO_RECUPERAR: ocultado temporalmente hasta completar módulo de configuración
  // { id: 'configuracion', label: 'Configuración', to: '/adminsis/configuracion', icon: <FaCog /> },
      ];
    }
    if (pathname.startsWith("/tecnico")) {
      return [
        { id: 'resumen', label: 'Resumen', to: '/tecnico', icon: <FaThLarge /> },
        { id: 'formulas', label: 'Fórmulas', to: '/tecnico/formulas', icon: <FaFlask /> },
        { id: 'productos', label: 'Productos', to: '/tecnico/productos', icon: <FaBox /> },
        { id: 'pedidos', label: 'Pedidos', to: '/tecnico/pedidos', icon: <FaClipboardList /> },
        { id: 'depositos', label: 'Depósitos', to: '/tecnico/depositos', icon: <FaWarehouse /> },
        { id: 'movimientos', label: 'Movimientos', to: '/tecnico/movimientos', icon: <FaTruck /> },
      ];
    }
    if (pathname.startsWith("/adminfab")) {
      return [
        { id: 'resumen', label: 'Resumen', to: '/adminfab', icon: <FaThLarge /> },
        { id: 'formulas', label: 'Fórmulas', to: '/adminfab/formulas', icon: <FaFlask /> },
        { id: 'productos', label: 'Productos', to: '/adminfab/productos', icon: <FaBox /> },
        { id: 'pedidos', label: 'Pedidos', to: '/adminfab/pedidos', icon: <FaClipboardList /> },
        { id: 'depositos', label: 'Depósitos', to: '/adminfab/depositos', icon: <FaWarehouse /> },
  { id: 'movimientos', label: 'Movimientos', to: '/adminfab/movimientos', icon: <FaTruck /> },
      ];
    }

    // Encargado Punto de Venta
    if (pathname.startsWith('/puntoventa')) {
      return [
        { id: 'resumen', label: 'Resumen', to: '/puntoventa', icon: <FaThLarge /> },
        { id: 'productos', label: 'Productos', to: '/puntoventa/productos', icon: <FaBox /> },
        { id: 'pedidos', label: 'Pedidos', to: '/puntoventa/pedidos', icon: <FaClipboardList /> },
        { id: 'depositos', label: 'Depósitos', to: '/puntoventa/depositos', icon: <FaWarehouse /> },
        { id: 'movimientos', label: 'Movimientos', to: '/puntoventa/movimientos', icon: <FaTruck /> },
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
    pathname.startsWith("/tecnico") ||
  pathname.startsWith('/puntoventa');

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
