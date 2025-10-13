import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../lib/auth";

interface SidebarFooterProps {
  collapsed: boolean;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ collapsed }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  if (collapsed) return null;

  return (
    <div className="mt-auto">
      <button
        onClick={async () => {
          await logout();
          navigate("/auth/login");
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

      <div className="mt-3 text-sm text-[#5d5448]/70">All-In Pharma · v1.0</div>
    </div>
  );
};

export default SidebarFooter;
