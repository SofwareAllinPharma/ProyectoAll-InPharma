import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

let __nextActionMenuId = 1;

export type ActionItem = {
  key?: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
};

export default function UserMenu({ items, ariaLabel = 'Acciones', menuWidth = 160, trigger }: { items: ActionItem[]; ariaLabel?: string; menuWidth?: number; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  // unique id for this instance so we can close other menus when one opens
  const idRef = useRef<number>(__nextActionMenuId++);


  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      // if click is inside the button/container or inside the portal menu, ignore
      if (containerRef.current && containerRef.current.contains(t)) return;
      if (menuRef.current && menuRef.current.contains(t)) return;
      setOpen(false);
    };

    const onOtherOpen = (ev: Event) => {
      // if some other menu opened, close this one
      const detail = (ev as CustomEvent).detail;
      if (detail && detail.source !== idRef.current) setOpen(false);
    };

    if (open) window.addEventListener('mousedown', onDoc);
    window.addEventListener('action-menu-open', onOtherOpen as EventListener);
    return () => {
      window.removeEventListener('mousedown', onDoc);
      window.removeEventListener('action-menu-open', onOtherOpen as EventListener);
    };
  }, [open]);

  // portal element lifecycle
  useEffect(() => {
    if (!portalRef.current) portalRef.current = document.createElement('div');
    const el = portalRef.current;
    document.body.appendChild(el);
    return () => { try { document.body.removeChild(el); } catch {} };
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef} onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        onPointerDown={(e) => {
          e.preventDefault();
          if (open) {
            setOpen(false);
            return;
          }
          // opening
          setOpen(true);
          if (btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            const left = Math.max(8, r.right - menuWidth);
            const top = r.bottom + window.scrollY + 6;
            setCoords({ left, top });
          }
          // notify other menus to close
          try {
            window.dispatchEvent(new CustomEvent('action-menu-open', { detail: { source: idRef.current } }));
          } catch (err) {}
        }}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
        aria-haspopup="true"
        aria-expanded={open}
        title={ariaLabel}
        aria-controls={`action-menu-${ariaLabel}`}
      >
        {trigger}
      </button>

      {open && portalRef.current && coords && createPortal(
          <div style={{ position: 'absolute', left: coords.left, top: coords.top, width: menuWidth, zIndex: 12000 }} role="presentation">
          <div id={`action-menu-${ariaLabel}`} className="bg-white rounded-md border border-gray-100 shadow-lg" role="menu" aria-label={ariaLabel} ref={menuRef}>
            {items.map((it, i) => (
              <button
                key={it.key ?? `${i}`}
                onClick={() => { setOpen(false); it.onClick(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                {it.icon}
                {it.label}
              </button>
            ))}
          </div>
        </div>,
        portalRef.current
      )}
    </div>
  );
}
