import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  open,
  onClose,
  children,
  className = '',
  containerClass = 'bg-white rounded-xl p-8 shadow-lg max-w-md w-full mx-4 min-h-[180px] transform -translate-y-6',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  containerClass?: string;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  if (!elRef.current) elRef.current = document.createElement('div');

  useEffect(() => {
    const el = elRef.current!;
    document.body.appendChild(el);
    return () => {
      try { document.body.removeChild(el); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev || '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center ${className}`} onClick={onClose}>
      <div className={containerClass} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    elRef.current,
  );
}