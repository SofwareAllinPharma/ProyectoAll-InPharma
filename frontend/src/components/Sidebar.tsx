import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode; // opcional (no hay fallback)
  to?: string;
}

interface SidebarProps {
  title: string;
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  collapsedControlled?: boolean; // opcional: controlar desde padre
  onToggleCollapsed?: (next: boolean) => void;
  expandedWidthClass?: string; // default "w-64"
  collapsedWidthClass?: string; // default "w-12" (solo botón)
}

const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path
      d="M3 6h18M3 12h18M3 18h18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path
      d="M15 6l-6 6 6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
  title,
  items,
  activeItem,
  onItemClick,
  collapsedControlled,
  onToggleCollapsed,
  expandedWidthClass = "w-64",
  collapsedWidthClass = "w-12",
}) => {
  const location = useLocation();

  // estado local + default colapsado en mobile
  const [collapsedLocal, setCollapsedLocal] = useState<boolean>(false);
  useEffect(() => {
    const isMobile = window.matchMedia?.("(max-width: 768px)").matches;
    setCollapsedLocal(isMobile); // mobile => colapsada por defecto
  }, []);

  const collapsed = collapsedControlled ?? collapsedLocal;

  const toggle = () => {
    const next = !collapsed;
    setCollapsedLocal(next);
    onToggleCollapsed?.(next);
  };

  // activo por ruta si no pasa activeItem
  const isActive = (item: SidebarItem) => {
    if (activeItem) return activeItem === item.id;
    if (!item.to) return false;
    if (item.to === "/adminfab") return location.pathname === "/adminfab";
    return location.pathname.startsWith(item.to);
  };

  const widthClass = collapsed ? collapsedWidthClass : expandedWidthClass;

  return (
    <aside
      className={`${widthClass} bg-[#5d5448] text-white min-h-screen sticky top-0 flex flex-col transition-[width] duration-300 z-40`}
    >
      {/* HEADER */}
      <div
        className={`flex items-center px-3 py-3 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {collapsed ? (
          // SOLO hamburguesa cuando está colapsada
          <button
            onClick={toggle}
            className="p-2 rounded-xl hover:bg-white/10 outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Abrir panel"
            title="Abrir"
          >
            <HamburgerIcon />
          </button>
        ) : (
          // Expandida: "Panel" a la izquierda (más grande) y flecha a la derecha
          <>
            <span className="font-semibold text-lg select-none truncate">
              {title}
            </span>
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-white/10 outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Cerrar panel"
              title="Cerrar"
            >
              <ChevronLeftIcon />
            </button>
          </>
        )}
      </div>

      {/* separador (solo expandida) */}
      {!collapsed && <div className="h-px bg-white/10 mx-3 mb-2" />}

      {/* NAV: oculto por completo si está colapsada */}
      {!collapsed && (
        <nav className="flex-1 space-y-2 px-2">
          {items.map((item) => {
            const active = isActive(item);
            const base =
              "flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer transition-colors";
            const activeCls = active ? "bg-white/20" : "hover:bg-white/10";

            const inner = (
              <div
                className={`${base} ${activeCls}`}
                onClick={() => onItemClick?.(item.id)}
              >
                {/* si el ícono existe lo muestro; no hay fallback */}
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </div>
            );

            return item.to ? (
              <Link key={item.id} to={item.to}>
                {inner}
              </Link>
            ) : (
              <div key={item.id}>{inner}</div>
            );
          })}
        </nav>
      )}

      {/* footer (opcional) solo expandida */}
      {!collapsed && (
        <div className="px-3 py-3 text-xs text-white/70">
          All-In Pharma · v1.0
        </div>
      )}
    </aside>
  );
};
