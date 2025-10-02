import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import type { SidebarItem } from '../components/Sidebar';

interface LayoutWithSidebarProps {
  title: string;
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
  defaultActiveItem?: string;
  onSidebarItemChange?: (itemId: string) => void;
}

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({
  title,
  sidebarItems,
  children,
  defaultActiveItem,
  onSidebarItemChange,
}) => {
  const [activeItem, setActiveItem] = useState<string>(
    defaultActiveItem || sidebarItems[0]?.id || ''
  );

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    onSidebarItemChange?.(itemId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        title={title}
        items={sidebarItems}
        onItemClick={handleItemClick}
      />
      <div className="flex-1">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};