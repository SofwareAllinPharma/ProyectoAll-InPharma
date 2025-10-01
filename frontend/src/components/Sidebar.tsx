import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

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
  const [cl, setCl] = useState(false);
  useEffect(() => {
    setCl(window.matchMedia?.("(max-width:768px)")?.matches ?? false);
  }, []);
  const collapsed = collapsedControlled ?? cl;
  const toggle = () => {
    const n = !collapsed;
    setCl(n);
    onToggleCollapsed?.(n);
  };
  const width = collapsed ? collapsedWidthClass : expandedWidthClass;
  const isRoot = (to?: string) =>
    !!to && to.split("/").filter(Boolean).length === 1;

  return (
    <aside
      className={`${width} bg-white text-[#5d5448] min-h-screen sticky top-0 flex flex-col transition-[width] duration-300 z-40`}
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
        <nav className="flex-1 space-y-2 px-2">
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

      {!collapsed && (
        <div className="px-3 py-3 text-xs text-[#5d5448]/70">
          All-In Pharma · v1.0
        </div>
      )}
    </aside>
  );
};
