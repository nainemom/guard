import './dialog.css';
import { cx } from '@/utils/cx';
import { useContext, useEffect, useMemo, useState, ReactNode, createContext } from 'react';
import Button from '@/components/form/Button';
import Icon from '@/components/shared/Icon';

type DialogId = number;

type Dialog = {
  id: DialogId,
  element: () => JSX.Element,
  isOpen?: boolean,
}

type DialogContext = {
  list: Dialog[],
  register: (dialog: Dialog) => void,
  unregister: (dialogId: DialogId) => void,
  open: (dialogId: DialogId) => void,
  close: (dialogId: DialogId) => void,
}

type DialogProps = {
  isOpen?: boolean,
  className?: string,
  children: ReactNode,
};

type DialogsProps = {
  children: ReactNode,
};

const dialogContext = createContext<DialogContext | null>(null);

let _dialogId: DialogId = 0;

export default function Dialog({ isOpen, className, children }: DialogProps) {
  const dialogs = useContext<DialogContext | null>(dialogContext);

  const dialogId = useMemo<DialogId>(() => _dialogId += 1, []);

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

  return <></>;
}

type DialogTitleProps = {
  title: string,
  closeButton?: boolean,
  onClose?: () => void,
};

const dialogTitleDefaultProps = {
  onClose: () => {},
};

export function DialogTitle(props: DialogTitleProps) {
  const { title, closeButton, onClose } = { ...dialogTitleDefaultProps, ...props };
  return (
    <div className="x-dialog-title">
      { closeButton && (
        <Button circle onClick={onClose} theme="transparent" ariaLabel="Close Dialog">
          <Icon name="arrow_back" className="h-6 w-6" />
        </Button>
      ) }
      <h2>
        {title}
      </h2>
    </div>
  );
}

type DialogBodyProps = {
  className?: string,
  children?: ReactNode,
};

export function DialogBody({ children, className }: DialogBodyProps) {
  return (
    <div className={cx('x-dialog-body', className)}>
      {children}
    </div>
  );
}

type DialogButtonsProps = {
  children?: ReactNode,
};

export function DialogButtons({ children }: DialogButtonsProps) {
  return (
    <div className="x-dialog-buttons">
      {children}
    </div>
  );
}

export function Dialogs({ children }: DialogsProps) {
  const [dialogs, setDialogs] = useState<Dialog[]>([]);

  const providerValue = useMemo<DialogContext>(() => ({
    list: dialogs,
    register: (dialog) => setDialogs((oldDialogs) => {
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
    unregister: (dialogId) => setDialogs((oldDialogs) => {
      const index = oldDialogs.findIndex((dialogItem) => dialogItem.id === dialogId);
      if (index === -1) {
        return oldDialogs;
      }
      return [
        ...oldDialogs.slice(0, index),
        ...oldDialogs.slice(index + 1),
      ];
    }),
    open: (dialogId) => setDialogs((oldDialogs) => {
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
    close: (dialogId) => setDialogs((oldDialogs) => {
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
      {
        opensDialog.map((dialog) => (
          <div key={dialog.id}>
            { dialog.element() }
          </div>
        ))
      }
    </dialogContext.Provider>
  );
}
