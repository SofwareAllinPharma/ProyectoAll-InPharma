import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  to?: string;
}
interface SidebarProps {
  title: string;
  items: SidebarItem[];
  onItemClick?: (id: string) => void;
  collapsedControlled?: boolean;
  onToggleCollapsed?: (next: boolean) => void;
  expandedWidthClass?: string;
  collapsedWidthClass?: string;
  footer?: React.ReactNode;
}

const Hamburger = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <path
      d="M3 6h18M3 12h18M3 18h18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
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
  onItemClick,
  collapsedControlled,
  onToggleCollapsed,
  expandedWidthClass = "w-64",
  collapsedWidthClass = "w-12",
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [cl, setCl] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(max-width:768px)");
    const setVals = () => {
      setCl(mq?.matches ?? false);
      setIsMobile(mq?.matches ?? false);
    };
    setVals();
    mq?.addEventListener?.('change', setVals);
    window.addEventListener('resize', setVals);
    return () => {
      mq?.removeEventListener?.('change', setVals);
      window.removeEventListener('resize', setVals);
    };
  }, []);
  const collapsed = collapsedControlled ?? cl;
  const toggle = () => {
    const n = !collapsed;
    setCl(n);
    onToggleCollapsed?.(n);
  };
  const width = collapsed ? collapsedWidthClass : expandedWidthClass;
  const overlay = isMobile && !collapsed;
  const isRoot = (to?: string) =>
    !!to && to.split("/").filter(Boolean).length === 1;

  // bloquear scroll del body cuando el sidebar se muestra como overlay en mobile
  useEffect(() => {
    if (overlay) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev || '';
      };
    }
    return;
  }, [overlay]);

  // si overlay=true (mobile desplegado) renderizamos backdrop y aside fixed encima
  return (
    <>
      {overlay && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => {
            // cerrar al click en backdrop
            setCl(true);
            onToggleCollapsed?.(true);
          }}
        />
      )}

      <aside
        className={`${width} bg-white text-[#5d5448] ${overlay ? 'fixed z-50 left-0 top-16' : 'sticky top-16'} h-[calc(100vh-4rem)] flex flex-col overflow-hidden transition-[width] duration-300`}
        style={overlay ? { boxShadow: '0 6px 18px rgba(0,0,0,0.12)' } : undefined}
      >
      <div
        className={`flex items-center px-3 py-3 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {collapsed ? (
          <button
            onClick={toggle}
            className="p-2 rounded-xl hover:bg-[#5d5448]/10 focus:ring-2 focus:ring-[#5d5448]/30"
            aria-label="Abrir"
          >
            <Hamburger />
          </button>
        ) : (
          <>
            <span className="font-semibold text-lg truncate">{title}</span>
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-[#5d5448]/10 focus:ring-2 focus:ring-[#5d5448]/30"
              aria-label="Cerrar"
            >
              <ChevronLeft />
            </button>
          </>
        )}
      </div>

      {!collapsed && <div className="h-px bg-[#5d5448]/10 mx-3 mb-2" />}

      {!collapsed && (
        <nav className="flex-1 space-y-2 px-2 overflow-auto">
          {items.map((it) =>
            it.to ? (
              <NavLink
                key={it.id}
                to={it.to}
                end={isRoot(it.to)}
                onClick={() => onItemClick?.(it.id)}
                className={({ isActive }) =>
                  `block rounded-xl transition-colors ${
                    isActive ? "bg-[#5d5448]/20" : "hover:bg-[#5d5448]/10"
                  }`
                }
                title={it.label}
              >
                <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                  {it.icon && <span className="shrink-0">{it.icon}</span>}
                  <span className="truncate">{it.label}</span>
                </div>
              </NavLink>
            ) : (
              <div
                key={it.id}
                onClick={() => onItemClick?.(it.id)}
                className="rounded-xl hover:bg-[#5d5448]/10"
              >
                <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                  {it.icon && <span className="shrink-0">{it.icon}</span>}
                  <span className="truncate">{it.label}</span>
                </div>
              </div>
            )
          )}
        </nav>
      )}

      {/* Footer: se coloca al final con mt-auto para que quede siempre visible */}
      <div className="px-3 py-3 text-xs text-[#5d5448]/70">
        {!collapsed ? (
          <div className="mt-auto">
            {/* Botón Cerrar Sesión más grande, estilo igual a items */}
            <button
              onClick={async () => {
                await logout();
                navigate('/auth/login');
              }}
              className="w-full block rounded-xl transition-colors hover:bg-[#5d5448]/10 text-red-600"
              title="Cerrar Sesión"
            >
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium">
                <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0 text-red-600">
                  <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M13 5H6a2 2 0 00-2 2v10a2 2 0 002 2h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <span className="truncate">Cerrar Sesión</span>
              </div>
            </button>

            {/* Versión abajo */}
            <div className="mt-3 text-sm text-[#5d5448]/70">All-In Pharma · v1.0</div>
          </div>
        ) : (
          // En modo colapsado no mostramos botón de logout en el footer
          <></>
        )}
      </div>
    </aside>
    </>
  );
};
