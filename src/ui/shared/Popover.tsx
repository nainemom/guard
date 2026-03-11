import { clsx } from 'clsx';
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export const Popover: FC<{
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
}> = ({ trigger, children }) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 120);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      close();
    } else {
      setOpen(true);
    }
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open, close]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="appearance-none bg-transparent border-none p-0 m-0"
      >
        {trigger}
      </button>
      {open && (
        <div
          className={clsx(
            'absolute end-0 top-full mt-1 z-50 rounded-lg border border-border bg-surface shadow-lg origin-top-right',
            closing
              ? 'animate-[menu-out_120ms_ease-in_forwards]'
              : 'animate-[menu-in_150ms_ease-out]',
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
};
