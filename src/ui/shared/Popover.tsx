import {
  cloneElement,
  type FC,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { tv } from 'tailwind-variants';

const CLOSE_DURATION = 120;

const panel = tv({
  base: 'absolute end-0 top-full mt-1 z-50 rounded-lg border border-border bg-surface shadow-lg origin-top-right',
  variants: {
    closing: {
      // Duration must match CLOSE_DURATION
      true: 'animate-[menu-out_120ms_ease-in_forwards]',
      false: 'animate-[menu-in_150ms_ease-out]',
    },
  },
});

export const Popover: FC<{
  trigger: ReactElement;
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
    }, CLOSE_DURATION);
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
      {cloneElement(trigger, { onClick: toggle })}
      {open && <div className={panel({ closing })}>{children(close)}</div>}
    </div>
  );
};
