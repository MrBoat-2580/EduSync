import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type Toast = { id: number; message: string; type: 'success' | 'error' };

type ToastContextValue = {
  toasts: Toast[];
  notify: (message: string, type?: 'success' | 'error') => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => dismiss(id), 3000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
