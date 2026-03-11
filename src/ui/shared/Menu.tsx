import { MoreVerticalIcon } from '@hugeicons/core-free-icons';
import { clsx } from 'clsx';
import type { FC, ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { Popover } from './Popover';

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
  return (
    <Popover
      trigger={
        <Button variant="ghost" iconOnly className="size-10">
          <Icon icon={MoreVerticalIcon} size={20} />
        </Button>
      }
    >
      {(close) => (
        <div className="min-w-64">
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
    </Popover>
  );
};
