import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import GlobalSnack from './GlobalSnack';

type Snack = {
  id: number;
  title?: string;
  message: string;
  duration?: number;
};

type Ctx = {
  show: (opts: Omit<Snack, 'id'>) => number;
  hide: (id: number) => void;
};

const GlobalSnackContext = createContext<Ctx | null>(null);

export const useGlobalSnack = () => {
  const ctx = useContext(GlobalSnackContext);
  if (!ctx) throw new Error('useGlobalSnack must be used within GlobalSnackProvider');
  return ctx;
};

export const GlobalSnackProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [current, setCurrent] = useState<Snack | null>(null);
  const counterRef = useRef(1);

  const hide = useCallback((id: number) => {
    setCurrent(c => (c && c.id === id ? null : c));
  }, []);

  const show = useCallback((opts: Omit<Snack, 'id'>) => {
    const id = counterRef.current++;
    setCurrent({ id, ...opts });
    return id;
  }, []);

  return (
    <GlobalSnackContext.Provider value={{ show, hide }}>
      {children}
      <GlobalSnack
        open={!!current}
        onClose={() => current && hide(current.id)}
        title={current?.title}
        message={current?.message || ''}
        duration={current?.duration}
      />
    </GlobalSnackContext.Provider>
  );
};

export default GlobalSnackContext;
