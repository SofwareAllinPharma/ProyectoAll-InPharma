import React from 'react';

export default function IconButton({
  onClick,
  children,
  className = '',
  'aria-label': ariaLabel,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} className={`p-2 rounded-xl hover:bg-[#5d5448]/10 focus:ring-2 focus:ring-[#5d5448]/30 ${className}`}>
      {children}
    </button>
  );
}
