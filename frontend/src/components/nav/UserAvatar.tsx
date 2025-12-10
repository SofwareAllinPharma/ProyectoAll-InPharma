import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

interface UserAvatarProps {
  name: string | null;
  showPerfilesOption?: boolean;
}

export default function UserAvatar({ name, showPerfilesOption = true }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const getInitials = (fullName: string | null): string => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);
  const displayName = name || "Usuario";

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePerfilesClick = () => {
    setIsOpen(false);
    navigate("/perfiles");
  };

  const handleMyDataClick = () => {
    setIsOpen(false);
    navigate("/mis-datos");
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userPerfil");
    navigate("/auth/login");
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
        >
          <div className="w-10 h-10 rounded-full bg-[#5d5448] text-white flex items-center justify-center font-semibold text-sm">
            {initials}
          </div>
          <span className="text-[#5d5448] font-medium hidden sm:block">{displayName}</span>
          <svg
            className={`w-4 h-4 text-[#5d5448] transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {showPerfilesOption && (
              <button
                onClick={handlePerfilesClick}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Perfiles
              </button>
            )}
            <button
              onClick={handleMyDataClick}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mis datos
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              onClick={handleLogoutClick}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <ConfirmLogoutModal
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
