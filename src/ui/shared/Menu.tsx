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
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export const Menu: FC<{
  items: MenuItem[];
}> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <Button variant="ghost" iconOnly onClick={toggle}>
        <Icon icon={MoreVerticalIcon} size={20} />
      </Button>
      {open && (
        <div className="absolute end-0 top-full mt-1 z-50 min-w-48 rounded-lg border border-border bg-surface shadow-lg py-1 origin-top-right animate-[menu-in_150ms_ease-out]">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              className={clsx(
                'flex items-center gap-3 w-full px-3 py-2.5 text-sm text-start',
                'transition-colors cursor-pointer',
                'hover:bg-surface-alt focus-visible:bg-surface-alt active:bg-surface',
                'disabled:opacity-40 disabled:cursor-default',
              )}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
