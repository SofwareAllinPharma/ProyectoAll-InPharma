import React from "react";
import { NavLink } from "react-router-dom";

export interface NavItemShape {
  id: string;
  label: string;
  icon?: React.ReactNode;
  to?: string;
}

interface NavItemProps {
  item: NavItemShape;
  end?: boolean; // passed to NavLink
  onItemClick?: (id: string) => void;
}

export const NavItem: React.FC<NavItemProps> = ({ item, end, onItemClick }) => {
  if (item.to) {
    return (
      <NavLink
        to={item.to}
        end={end}
        onClick={() => onItemClick?.(item.id)}
        className={({ isActive }) =>
          `block rounded-xl transition-colors ${
            isActive ? "bg-[#5d5448]/20" : "hover:bg-[#5d5448]/10"
          }`
        }
        title={item.label}
      >
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          <span className="truncate">{item.label}</span>
        </div>
      </NavLink>
    );
  }

  return (
    <div
      onClick={() => onItemClick?.(item.id)}
      className="rounded-xl hover:bg-[#5d5448]/10"
    >
      <div className="flex items-center gap-3 rounded-xl px-3 py-2">
        {item.icon && <span className="shrink-0">{item.icon}</span>}
        <span className="truncate">{item.label}</span>
      </div>
    </div>
  );
};

export default NavItem;
