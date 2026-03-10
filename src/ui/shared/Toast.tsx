import { clsx } from 'clsx';
import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface ToastItem {
  id: string;
  content: ReactNode;
  persistent?: boolean;
}

interface ToastContextValue {
  show: (content: ReactNode, duration?: number) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (content: ReactNode, duration = 2000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [
        ...prev,
        { id, content, persistent: duration === 0 },
      ]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 left-4 right-4 mx-auto max-w-sm z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto rounded-2xl shadow-2xl bg-surface border border-border animate-in',
            )}
          >
            {typeof toast.content === 'string' ? (
              <p className="px-4 py-3 text-sm text-text text-center">
                {toast.content}
              </p>
            ) : (
              toast.content
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
