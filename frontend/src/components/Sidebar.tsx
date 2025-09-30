import React from 'react';

import { Link, useLocation } from 'react-router-dom';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** opcional: ruta a la que navegar cuando se cliquea */
  to?: string;
}

interface SidebarProps {
  title: string;
  items: SidebarItem[];
  /** opcional: si se quiere controlar desde el padre */
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  title,
  items,
  activeItem,
  onItemClick,
}) => {
  const location = useLocation();

  const deriveActive = (item: SidebarItem) => {
    if (activeItem) return activeItem === item.id;
    if (item.to) {
      return location.pathname.startsWith(item.to);
    }
    return false;
  };

  return (
    <div className="w-64 bg-[#5d5448] h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
      <nav className="p-4">
        {items.map((item) => {
          const isActive = deriveActive(item);
          const content = (
            <div className={`w-full flex items-center gap-2 px-2 py-3 text-sm rounded-md mb-1 transition-colors ${
              isActive ? 'bg-[#7c6a55] text-white' : 'text-gray-300 hover:bg-[#7c6a55] hover:text-white'
            }`}>
              {item.icon}
              <span>{item.label}</span>
            </div>
          );

          if (item.to) {
            return (
              <Link
                key={item.id}
                to={item.to}
                onClick={() => onItemClick?.(item.id)}
                className="block"
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="w-full text-left"
            >
              {content}
            </button>
          );
        })}
      </nav>
    </div>
  );
};