import './notification.css';
import { cx } from '@/utils/cx';
import { ComponentChildren, createContext, VNode } from 'preact';
import { useCallback, useContext, useEffect, useMemo, useState } from 'preact/hooks';
import Button from '@/components/form/Button';
import Icon from '@/components/shared/Icon';

type NotifcationsProps = {
  children: ComponentChildren,
};

type Toast = {
  id: number,
  message: string,
  created: number,
};

const eventTarget = document.createElement('DIV');

export const showToast = (message: string) => eventTarget.dispatchEvent(new CustomEvent('toast', {
  detail: message,
}));


export function Notifcations({ children }: NotifcationsProps) {
  const [cleanInterval, setCleanInterval] = useState<ReturnType<typeof setInterval>>();
  const [activeToasts, setActiveToasts] = useState<Toast[]>([]);
  const [currentToastId, setCurrentToastId] = useState<number>(0);

  const addToast = useCallback((event: CustomEventInit) => {
    setActiveToasts((p) => [
      ...p,
      {
        message: event.detail,
        id: currentToastId,
        created: Date.now(),
      },
    ]);
    setCurrentToastId((p) => p + 1);
  }, [currentToastId, setActiveToasts]);

  const removeToast = useCallback((id: number) => {
    setActiveToasts((p) => {
      const index = p.findIndex((toastItem) => toastItem.id === id);
      if (index > -1) {
        return [
          ...p.slice(0, index),
          ...p.slice(index + 1),
        ];
      }
      return p;
    });
  }, [setActiveToasts]);

  const autoClean = useCallback(() => {
    setActiveToasts((p) => p.filter((toastItem) => toastItem.created + 3000 > Date.now()));
  }, [setActiveToasts]);

  useEffect(() => {
    setCleanInterval(setInterval(autoClean, 1000));
    eventTarget.addEventListener('toast', addToast);
    return () => {
      eventTarget.removeEventListener('toast', addToast);
      clearInterval(cleanInterval);
    }
  }, [setCleanInterval, autoClean]);

  return (
    <>
      { children }
      { activeToasts.length > 0 && (
        <div className="x-toasts">
          {
            activeToasts.map((toast) => (
              <div className="x-toast-item" onClick={() => removeToast(toast.id)}>{ toast.message }</div>
            ))
          }
        </div>
      ) }
    </>
  );
}