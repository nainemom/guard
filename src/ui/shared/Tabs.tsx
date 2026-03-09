import { clsx } from 'clsx';
import type { FC } from 'react';

export const Tabs: FC<{
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ items, value, onChange, className }) => (
  <div
    className={clsx(
      'inline-flex w-full rounded-lg bg-surface-alt p-1 gap-1',
      className,
    )}
  >
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        className={clsx(
          'flex-1 rounded-md px-4 py-2 text-sm font-medium cursor-pointer transition-colors outline-none',
          value === item.id
            ? 'bg-primary text-on-primary shadow-sm'
            : 'text-text-muted hover:text-text',
        )}
        onClick={() => onChange(item.id)}
      >
        {item.label}
      </button>
    ))}
  </div>
);
