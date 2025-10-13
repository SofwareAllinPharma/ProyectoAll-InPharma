import React from "react";

interface SidebarHeaderProps {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ title, collapsed, onToggle }) => {
  const Hamburger = () => (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  const ChevronLeft = () => (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );

  return (
    <div className={`flex items-center px-3 py-3 ${collapsed ? "justify-center" : "justify-between"}`}>
      {collapsed ? (
        <button onClick={onToggle} className="p-2 rounded-xl hover:bg-[#5d5448]/10 focus:ring-2 focus:ring-[#5d5448]/30" aria-label="Abrir">
          <Hamburger />
        </button>
      ) : (
        <>
          <span className="font-semibold text-lg truncate">{title}</span>
          <button onClick={onToggle} className="p-2 rounded-xl hover:bg-[#5d5448]/10 focus:ring-2 focus:ring-[#5d5448]/30" aria-label="Cerrar">
            <ChevronLeft />
          </button>
        </>
      )}
    </div>
  );
};

export default SidebarHeader;
