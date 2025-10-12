import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type ActionItem = {
  key?: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
};

export default function ActionMenu({ items, ariaLabel = 'Acciones' }: { items: ActionItem[]; ariaLabel?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      const t = e.target as Node;
      if (!ref.current.contains(t)) setOpen(false);
    };
    if (open) window.addEventListener('mousedown', onDoc);
    return () => window.removeEventListener('mousedown', onDoc);
  }, [open]);

  // portal element lifecycle
  useEffect(() => {
    if (!portalRef.current) portalRef.current = document.createElement('div');
    const el = portalRef.current;
    document.body.appendChild(el);
    return () => { try { document.body.removeChild(el); } catch {} };
  }, []);

  return (
    <div className="relative inline-block" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        onPointerDown={(e) => { e.preventDefault(); setOpen(v => !v); if (!open && btnRef.current) {
          const r = btnRef.current.getBoundingClientRect();
          const menuWidth = 160; // w-40
          const left = Math.max(8, r.right - menuWidth);
          const top = r.bottom + window.scrollY + 6;
          setCoords({ left, top });
        } }}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
        aria-haspopup="true"
        aria-expanded={open}
        title={ariaLabel}
        aria-controls={`action-menu-${ariaLabel}`}
      >
        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
        </svg>
      </button>

      {open && portalRef.current && coords && createPortal(
        <div style={{ position: 'absolute', left: coords.left, top: coords.top, width: 160, zIndex: 12000 }} role="presentation">
          <div id={`action-menu-${ariaLabel}`} className="bg-white rounded-md border border-gray-100 shadow-lg" role="menu" aria-label={ariaLabel} ref={ref}>
            {items.map((it, i) => (
              <button
                key={it.key ?? `${i}`}
                onClick={() => { setOpen(false); it.onClick(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-800 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                {it.icon}
                <span>{it.label}</span>
              </button>
            ))}
          </div>
        </div>,
        portalRef.current
      )}
    </div>
  );
}
