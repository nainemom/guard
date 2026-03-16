import { MoreVerticalIcon } from '@hugeicons/core-free-icons';
import type { FC, ReactNode } from 'react';
import { tv } from 'tailwind-variants';
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

const menuItem = tv({
  base: 'flex items-center gap-3 w-full px-3 text-sm text-start transition-colors cursor-pointer hover:bg-surface-alt focus-visible:bg-surface-alt active:bg-surface disabled:opacity-40 disabled:cursor-default',
  variants: {
    danger: {
      true: 'text-error',
      false: 'text-text',
    },
    hasDescription: {
      true: 'py-2.5',
      false: 'py-2',
    },
  },
  defaultVariants: {
    danger: false,
    hasDescription: false,
  },
});

const menuItemDescription = tv({
  base: 'text-xs font-normal',
  variants: {
    danger: {
      true: 'text-error/60',
      false: 'text-text-muted',
    },
  },
});

export const Menu: FC<{
  items: MenuEntry[];
}> = ({ items }) => {
  return (
    <Popover
      trigger={
        <Button variant="ghost" iconOnly>
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
                className={menuItem({
                  danger: entry.danger,
                  hasDescription: !!entry.description,
                })}
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
                      className={menuItemDescription({ danger: entry.danger })}
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
