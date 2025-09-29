import React from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  title: string;
  items: SidebarItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  title,
  items,
  activeItem,
  onItemClick,
}) => {
  return (
    <div className="w-64 bg-[#5d5448]">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
      <nav className="p-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`w-full flex items-center gap-2 px-2 py-3 text-sm rounded-md mb-1 transition-colors ${
              activeItem === item.id
                ? 'bg-[#7c6a55] text-white'
                : 'text-gray-300 hover:bg-[#7c6a55] hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};