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
  containerClass = 'bg-white rounded-xl p-8 shadow-lg max-w-md w-full mx-4 min-h-[180px]',
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
    // Outer: full-screen overlay that scrolls if modal content is taller than viewport
    <div
      className={`fixed inset-0 z-[10000] overflow-y-auto ${backdropClassName} ${className}`}
      onClick={onClose}
    >
      {/* Centering wrapper — clicking it (outside the modal box) closes the modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={containerClass} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>,
    elRef.current,
  );
}
