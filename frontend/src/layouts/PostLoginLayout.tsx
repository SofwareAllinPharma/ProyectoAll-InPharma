import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import NavbarPostLogin from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import type { SidebarItem } from "../components/Sidebar";
import { ROLE_NAV_ITEMS } from "../config/navigation";
import { ArrowLeft } from "lucide-react";

export default function PostLoginLoyout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean | undefined>(
    undefined
  );

  const getItemsForPath = (pathname: string): SidebarItem[] => {
    if (pathname.startsWith('/adminsis')) return ROLE_NAV_ITEMS.ADMINSIS;
    if (pathname.startsWith("/tecnico")) return ROLE_NAV_ITEMS.TECNICO;
    if (pathname.startsWith("/adminfab")) return ROLE_NAV_ITEMS.ADMINFAB;
    if (pathname.startsWith("/puntoventa")) return ROLE_NAV_ITEMS.ENCPTOVENTA;
    if (pathname.startsWith("/mis-datos")) {
      return [
        {
          id: "volver",
          label: "Volver",
          icon: <ArrowLeft className="w-5 h-5" />,
          to: "/perfiles"
        }
      ];
    }
    
    return [];
  };

  const items = getItemsForPath(location.pathname);
  const pathname = location.pathname;
  const isDashboard =
    pathname.startsWith("/adminsis") ||
    pathname.startsWith("/adminfab") ||
    pathname.startsWith("/tecnico") ||
    pathname.startsWith('/puntoventa') ||
    pathname.startsWith("/mis-datos");

  useEffect(() => {
    if (pathname.startsWith("/mis-datos")) {
      setSidebarCollapsed(true);
    } else if (isDashboard) {
      setSidebarCollapsed(undefined);
    }
  }, [isDashboard, pathname]);

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
