import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Global lock to handle nested/overlapping modals safely
let __modalLockCount = 0;
let __modalOriginalOverflow: string | null = null;

function lockBodyScroll() {
  if (__modalLockCount === 0) {
    __modalOriginalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  __modalLockCount += 1;
}

function unlockBodyScroll() {
  __modalLockCount = Math.max(0, __modalLockCount - 1);
  if (__modalLockCount === 0) {
    document.body.style.overflow = __modalOriginalOverflow || '';
    __modalOriginalOverflow = null;
  }
}

export default function Modal({
  open,
  onClose,
  children,
  backdropClassName = 'bg-black/40 backdrop-blur-[2px]',
  className = '',
  containerClass = 'bg-white rounded-xl p-8 shadow-lg max-w-md w-full mx-4 min-h-[180px] transform -translate-y-6',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropClassName?: string;
  className?: string;
  containerClass?: string;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  if (!elRef.current) elRef.current = document.createElement('div');

  useEffect(() => {
    const el = elRef.current!;
    document.body.appendChild(el);
    return () => {
      // eslint-disable-next-line no-empty
      try { document.body.removeChild(el); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    lockBodyScroll();
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockBodyScroll();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center ${backdropClassName} ${className}`}
      onClick={onClose}
    >
      <div className={containerClass} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    elRef.current,
  );
}
