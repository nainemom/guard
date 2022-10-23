import './dialog.css';
import { cx } from '@/utils/cx';
import { ComponentChildren, createContext, VNode } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';

type Dialog = {
  id: string,
  element: () => VNode,
  isOpen?: boolean,
}

type DialogContext = {
  list: Dialog[],
  register: (dialog: Dialog) => void,
  unregister: (dialogId: string) => void,
  open: (dialogId: string) => void,
  close: (dialogId: string) => void,
}

type DialogProps = {
  isOpen?: boolean,
  className?: string,
  children: ComponentChildren,
};

type DialogsProps = {
  children: ComponentChildren,
};

const dialogContext = createContext<DialogContext | null>(null);

export default function Dialog({ isOpen, className, children }: DialogProps) {
  const dialogs = useContext<DialogContext | null>(dialogContext);

  const dialogId = useMemo<string>(() => crypto.randomUUID(), []);

  useEffect(() => {
    dialogs?.register?.({
      id: dialogId,
      isOpen,
      element: () => (
        <div
          className={cx('x-dialog', className)}
        >
          {children}
        </div>
      ),
    });
    return () => {
      dialogs?.unregister?.(dialogId);
    };
  }, [dialogId, children]);

  useEffect(() => {
    return dialogs?.[isOpen ? 'open' : 'close']?.(dialogId);
  }, [isOpen, dialogId]);

  return <div></div>;
}

export function Dialogs({ children }: DialogsProps) {
  const [dialogs, setDialogs] = useState<Dialog[]>([]);

  const providerValue = useMemo<DialogContext>(() => ({
    list: dialogs,
    register: (dialog: Dialog) => setDialogs((oldDialogs) => {
      const index = oldDialogs.findIndex((dialogItem) => dialogItem.id === dialog.id);
      if (index === -1) {
        return [
          ...oldDialogs,
          dialog,
        ];
      }
      return [
        ...oldDialogs.slice(0, index),
        dialog,
        ...oldDialogs.slice(index + 1),
      ];
    }),
    unregister: (dialogId: string) => setDialogs((oldDialogs) => {
      const index = oldDialogs.findIndex((dialogItem) => dialogItem.id === dialogId);
      if (index === -1) {
        return oldDialogs;
      }
      return [
        ...oldDialogs.slice(0, index),
        ...oldDialogs.slice(index + 1),
      ];
    }),
    open: (dialogId: string) => setDialogs((oldDialogs) => {
      const index = oldDialogs.findIndex((dialogItem) => dialogItem.id === dialogId);
      if (index === -1) {
        return oldDialogs;
      }
      return [
        ...oldDialogs.slice(0, index),
        {
          ...oldDialogs[index],
          isOpen: true,
        },
        ...oldDialogs.slice(index + 1),
      ];
    }),
    close: (dialogId: string) => setDialogs((oldDialogs) => {
      const index = oldDialogs.findIndex((dialogItem) => dialogItem.id === dialogId);
      if (index === -1) {
        return oldDialogs;
      }
      return [
        ...oldDialogs.slice(0, index),
        {
          ...oldDialogs[index],
          isOpen: false,
        },
        ...oldDialogs.slice(index + 1),
      ];
    }),
  }), [dialogs, setDialogs]);

  const opensDialog = useMemo(() => dialogs.filter((dialog) => dialog.isOpen), [dialogs]);

  return (
    <dialogContext.Provider value={providerValue}>
      { children }
      { opensDialog.length > 0 && (
        <div
          className="x-dialog-container"
          style={{ zIndex: 999 }}
        >
          {
            opensDialog.map((dialog) => (
              dialog.element()
            ))
          }
        </div>
      ) }
    </dialogContext.Provider>
  );
}
