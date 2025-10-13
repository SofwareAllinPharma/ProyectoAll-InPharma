import React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'custom';

export type ToastProps = {
  id?: string | number;
  title?: string;
  message: string;
  type?: ToastType;
  color?: string; // used when type === 'custom'
  onClose?: () => void;
  duration?: number; // milliseconds to auto-dismiss (default 5000)
};

const colorMap: Record<ToastType, { bg: string; text: string }> = {
  success: { bg: 'bg-green-50', text: 'text-green-800' },
  error: { bg: 'bg-red-50', text: 'text-red-800' },
  info: { bg: 'bg-blue-50', text: 'text-blue-800' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-800' },
  custom: { bg: '', text: '' },
};

export default function Toast({ title, message, type = 'info', color, onClose, duration = 5000 }: ToastProps) {
  const styleBg = type === 'custom' && color ? { backgroundColor: color, color: '#fff' } : undefined;
  const classes = type === 'custom' ? 'text-white' : colorMap[type].text;
  const borderClass =
    type === 'success'
      ? 'border border-green-200'
      : type === 'error'
      ? 'border border-red-200'
      : type === 'info'
      ? 'border border-blue-200'
      : type === 'warning'
      ? 'border border-yellow-200'
      : '';

  // Auto-dismiss logic with pause on hover
  const timerRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number | null>(null);
  const remainingRef = React.useRef<number>(duration);

  React.useEffect(() => {
    console.log('[Toast] mount', message);
    startRef.current = Date.now();
    timerRef.current = window.setTimeout(() => onClose && onClose(), remainingRef.current);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []); // run once on mount

  const handleMouseEnter = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - (startRef.current ?? Date.now());
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
  };

  const handleMouseLeave = () => {
    startRef.current = Date.now();
    timerRef.current = window.setTimeout(() => onClose && onClose(), remainingRef.current);
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={`w-full rounded-md overflow-hidden ${type !== 'custom' ? colorMap[type].bg : ''} ${borderClass} transform transition-all duration-300`} style={styleBg}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${classes}`}>
            {/* simple icon per type */}
            {type === 'success' && (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172l-3.293-3.293A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z"/></svg>
            )}
            {type === 'error' && (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.257 3.099c.765-1.36 2.68-1.36 3.445 0l6.518 11.587C19.35 16.7 18.425 18 17.04 18H2.96c-1.385 0-2.31-1.3-1.18-2.314L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z"/></svg>
            )}
            {type === 'info' && (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-9-1a1 1 0 112 0v5a1 1 0 11-2 0V9zm1-3a1.25 1.25 0 100 2.5A1.25 1.25 0 0010 6z"/></svg>
            )}
            {type === 'warning' && (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.257 3.099c.765-1.36 2.68-1.36 3.445 0l6.518 11.587C19.35 16.7 18.425 18 17.04 18H2.96c-1.385 0-2.31-1.3-1.18-2.314L8.257 3.1zM9 7h2v5H9V7zm0 6h2v2H9v-2z"/></svg>
            )}
          </div>

          <div className="flex-1">
            {title && <div className={`font-semibold ${classes}`}>{title}</div>}
            <div className={`text-sm mt-1 ${type === 'custom' ? 'text-white/90' : classes}`}>{message}</div>
          </div>

          <div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
