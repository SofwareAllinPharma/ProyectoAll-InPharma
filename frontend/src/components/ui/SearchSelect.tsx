import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type SearchSelectProps<T> = {
  items: T[];
  value?: T | null;
  getKey: (item: T) => string | number;
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  noResultsText?: string;
  // opcional: permitir que el input interno reciba autofocus
  inputAutoFocus?: boolean;
  // opcional: callback cuando el input pierde foco
  onInputBlur?: () => void;
};

export default function SearchSelect<T>({
  items,
  value = null,
  getKey,
  getLabel,
  onSelect,
  placeholder = 'Buscar...',
  disabled = false,
  className = '',
  noResultsText = 'No hay resultados',
  inputAutoFocus = false,
  onInputBlur,
}: SearchSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (value) setQuery(getLabel(value));
  }, [value, getLabel]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      const inRef = ref.current && ref.current.contains(target);
      const inPortal = portalRef.current && portalRef.current.contains(target as Node);
      if (!inRef && !inPortal) setOpen(false);
    };
    window.addEventListener('mousedown', onDoc);
    return () => window.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!portalRef.current) portalRef.current = document.createElement('div');
    const el = portalRef.current;
    document.body.appendChild(el);
    return () => {
      try { document.body.removeChild(el); } catch {}
    };
  }, []);

  const filtered = query.trim()
    ? items.filter(i => getLabel(i).toLowerCase().includes(query.toLowerCase()))
    : items;

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) setOpen(true);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, Math.max(0, filtered.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(0, h - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = filtered[highlight];
      if (sel) {
        onSelect(sel);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // compute input rect when opening or on resize/scroll
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const inp = inputRef.current;
      if (!inp) return setRect(null);
      const r = inp.getBoundingClientRect();
      setRect({ top: r.bottom, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, inputRef.current]);

  const dropdown = (
    <div style={rect ? { position: 'fixed', top: rect.top + 'px', left: rect.left + 'px', width: rect.width + 'px' } : undefined} className="z-[10010] mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
      {filtered.length === 0 ? (
        <div className="p-3 text-sm text-gray-500">{noResultsText}</div>
      ) : (
        filtered.map((it, idx) => (
          <button
            key={String(getKey(it))}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); }}
            onClick={() => { onSelect(it); setOpen(false); }}
            onMouseEnter={() => setHighlight(idx)}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${idx === highlight ? 'bg-gray-100' : ''}`}
          >
            {getLabel(it)}
          </button>
        ))
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={ref}>
      <input
        ref={inputRef}
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] text-sm"
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(0); }}
        onFocus={() => setOpen(true)}
        autoFocus={inputAutoFocus}
        onBlur={() => { onInputBlur?.(); }}
        onKeyDown={handleKey}
        disabled={disabled}
        aria-autocomplete="list"
      />

      {open && portalRef.current ? createPortal(dropdown, portalRef.current) : open && dropdown}
    </div>
  );
}
