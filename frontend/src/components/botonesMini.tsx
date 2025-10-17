import { Link } from 'react-router-dom';
import React from 'react';

type Variant = 'traslado' | 'pedido';

type Props = {
  variant: Variant;
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  to?: string; // si querés navegar en lugar de onClick
};

const base = 'w-9 h-9 rounded-lg inline-flex items-center justify-center transition duration-200 focus:outline-none focus:ring-2';
const styles: Record<Variant, string> = {
  traslado: `${base} border border-[#9D977B] bg-transparent text-[#7C6A55] hover:bg-[#9D977B]/10 focus:ring-[#9D977B]/40`,
  pedido:   `${base} bg-[#9D977B] text-white hover:bg-[#8A8569] shadow-sm focus:ring-[#9D977B]/40`,
};

export default function MiniActionButton({ variant, title, icon, onClick, to }: Props) {
  const cls = styles[variant];
  if (to) {
    return (
      <Link to={to} title={title} aria-label={title} className={cls}>
        {icon}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} className={cls}>
      {icon}
    </button>
  );
}
