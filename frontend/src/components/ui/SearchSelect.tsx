import React, { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    // show label of value when provided
    if (value) setQuery(getLabel(value));
  }, [value, getLabel]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onDoc);
    return () => window.removeEventListener('mousedown', onDoc);
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

  return (
    <div className={`relative ${className}`} ref={ref}>
      <input
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

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
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
      )}
    </div>
  );
}
