import { Link } from 'react-router-dom';
import React from 'react';

type Variant = 'solid' | 'outline';

type Props = {
  variant?: Variant;
  className?: string;
  children?: React.ReactNode;
  to?: string;
  onClick?: () => void;
  title?: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
};

const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg transition duration-200 focus:outline-none focus:ring-2';
const variants: Record<Variant, string> = {
  outline: `${base} border border-[#9D977B] text-[#3E3529] bg-transparent hover:bg-[#9D977B]/10 focus:ring-[#9D977B]/40`,
  solid: `${base} bg-[#9D977B] text-white hover:bg-[#8A8569] shadow-sm focus:ring-[#9D977B]/40`,
};

export default function Button({ variant = 'solid', className = '', children, to, onClick, title, icon, ariaLabel }: Props) {
  const cls = `${variants[variant]} ${className}`.trim();
  if (to) {
    return (
      <Link to={to} title={title} aria-label={ariaLabel} className={cls}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} title={title} aria-label={ariaLabel} className={cls}>
      {icon}
      {children}
    </button>
  );
}
