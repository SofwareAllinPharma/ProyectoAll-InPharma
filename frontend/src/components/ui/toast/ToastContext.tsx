import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
// ReactDOM removed: rendering toasts inline instead of portal
import type { ToastProps } from './Toast';

type ToastEntry = ToastProps & { id: number };

type ToastContextValue = {
  show: (opts: Omit<ToastProps, 'onClose'>) => number;
  hide: (id: number) => void;
  toasts: ToastEntry[];
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const idRef = useRef(1);

  const hide = useCallback((id: number) => {
    console.log('[ToastProvider] hide', id);
    setToasts(s => s.filter(t => t.id !== id));
  }, []);

  const show = useCallback((opts: Omit<ToastProps, 'onClose'>) => {
    const id = idRef.current++;
    const entry: ToastEntry = { ...opts, id } as ToastEntry;
    console.log('[ToastProvider] show', id, entry);
    setToasts(s => [...s, entry]);
    // fallback removal in case the Toast component's own timer doesn't fire
    const duration = (opts as any).duration ?? 5000;
    window.setTimeout(() => hide(id), duration);
    return id;
  }, [hide]);

  return (
    <ToastContext.Provider value={{ show, hide, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastContext;
