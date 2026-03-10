import { MoreVerticalIcon } from '@hugeicons/core-free-icons';
import { clsx } from 'clsx';
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface MenuItem {
  label: string;
  description?: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

type MenuEntry = MenuItem | 'divider';

export const Menu: FC<{
  items: MenuEntry[];
}> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open, close]);

  return (
    <div ref={menuRef} className="relative">
      <Button variant="ghost" iconOnly onClick={toggle} className="size-10">
        <Icon icon={MoreVerticalIcon} size={20} />
      </Button>
      {open && (
        <div
          className={clsx(
            'absolute end-0 top-full mt-1 z-50 rounded-lg border border-border bg-surface shadow-lg origin-top-right',
            items.some((e) => e !== 'divider' && e.description)
              ? 'min-w-64'
              : 'min-w-40',
            closing
              ? 'animate-[menu-out_120ms_ease-in_forwards]'
              : 'animate-[menu-in_150ms_ease-out]',
          )}
        >
          {items.map((entry, i) => {
            if (entry === 'divider') {
              return (
                <div
                  key={`d${i.toString()}`}
                  className="my-1 border-t border-border-light"
                />
              );
            }
            return (
              <button
                key={entry.label}
                type="button"
                disabled={entry.disabled}
                className={clsx(
                  'flex items-center gap-3 w-full px-3 text-sm text-start',
                  entry.description ? 'py-2.5' : 'py-2',
                  'transition-colors cursor-pointer',
                  'hover:bg-surface-alt focus-visible:bg-surface-alt active:bg-surface',
                  'disabled:opacity-40 disabled:cursor-default',
                  entry.danger ? 'text-error' : 'text-text',
                )}
                onClick={() => {
                  close();
                  entry.onClick();
                }}
              >
                <span className="shrink-0">{entry.icon}</span>
                <div className="flex flex-col">
                  <span>{entry.label}</span>
                  {entry.description && (
                    <span
                      className={clsx(
                        'text-xs font-normal',
                        entry.danger ? 'text-error/60' : 'text-text-muted',
                      )}
                    >
                      {entry.description}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
