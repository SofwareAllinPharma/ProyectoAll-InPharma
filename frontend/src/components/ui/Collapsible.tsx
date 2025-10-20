import { useState } from 'react';
import type { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  children: ReactNode;
  initiallyOpen?: boolean;
  wrapperClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export default function Collapsible({ title, children, initiallyOpen = false, wrapperClassName = '', headerClassName = '', contentClassName = '' }: Props) {
  const [open, setOpen] = useState(Boolean(initiallyOpen));

  return (
    <div className={`w-full ${wrapperClassName}`}>
      <div className="border border-gray-100 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center justify-between ${headerClassName}`}
        >
          <div className="text-sm font-semibold text-gray-700">{title}</div>
          <svg
            className={`w-5 h-5 text-gray-700 transform transition-transform ${open ? 'rotate-180' : 'rotate-0'}`}
            viewBox="0 0 20 20"
            fill="none"
          >
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div className={contentClassName}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
