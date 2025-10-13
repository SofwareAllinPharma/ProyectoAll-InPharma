import React, { useEffect, useState } from "react";
import NavItem from "./ui/sidebar/NavItem";
import SidebarFooter from "./ui/sidebar/SidebarFooter";
import SidebarHeader from "./ui/sidebar/SidebarHeader";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

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

const Sidebar: React.FC<SidebarProps> = ({
  title,
  items,
  onItemClick,
  collapsedControlled,
  onToggleCollapsed,
  expandedWidthClass = "w-64",
  collapsedWidthClass = "w-12",
}) => {
  const [cl, setCl] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(max-width:768px)");
    const setVals = () => {
      setCl(mq?.matches ?? false);
      setIsMobile(mq?.matches ?? false);
    };
    setVals();
    mq?.addEventListener?.("change", setVals);
    window.addEventListener("resize", setVals);
    return () => {
      mq?.removeEventListener?.("change", setVals);
      window.removeEventListener("resize", setVals);
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
  const isRoot = (to?: string) => !!to && to.split("/").filter(Boolean).length === 1;

  useLockBodyScroll(overlay);

  const inlineWidth = collapsed ? '3rem' : '16rem';

  return (
    <>
      {overlay && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => {
            setCl(true);
            onToggleCollapsed?.(true);
          }}
        />
      )}

      <aside
        className={`${width} bg-white text-[#5d5448] ${
          overlay ? "fixed z-50 left-0 top-16" : "sticky top-16"
        } h-[calc(100vh-4rem)] flex flex-col overflow-hidden transition-[width] duration-300`}
        style={overlay ? { boxShadow: "0 6px 18px rgba(0,0,0,0.12)", width: inlineWidth, minWidth: inlineWidth } : { width: inlineWidth, minWidth: inlineWidth }}
      >
        <SidebarHeader title={title} collapsed={collapsed} onToggle={toggle} />

        {!collapsed && <div className="h-px bg-[#5d5448]/10 mx-3 mb-2" />}

        {!collapsed && (
          <nav className="flex-1 space-y-2 px-2 overflow-auto">
            {items.map((it) => (
              <NavItem key={it.id} item={it} end={isRoot(it.to)} onItemClick={onItemClick} />
            ))}
          </nav>
        )}

        <div className="px-3 py-3 text-xs text-[#5d5448]/70">
          <SidebarFooter collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

