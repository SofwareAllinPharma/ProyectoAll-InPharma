import React from 'react';
import { Sidebar } from '../components/Sidebar';
import type { SidebarItem } from '../components/Sidebar';

interface LayoutWithSidebarProps {
  title: string;
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
  onSidebarItemChange?: (itemId: string) => void;
  footer?: React.ReactNode;
}

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({
  title,
  sidebarItems,
  children,
  onSidebarItemChange,
  footer,
}) => {
  // No guardamos localmente el item activo aquí — el Sidebar usa NavLink
  const handleItemClick = (itemId: string) => {
    onSidebarItemChange?.(itemId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        title={title}
        items={sidebarItems}
        onItemClick={handleItemClick}
        footer={footer}
      />
      <div className="flex-1">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};