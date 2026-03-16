import type { FC } from 'react';
import { tv } from 'tailwind-variants';

const tabs = tv({
  base: 'inline-flex w-full rounded-lg bg-surface-alt p-1 gap-1',
});

const tab = tv({
  base: 'flex-1 rounded-md px-4 py-2 text-sm font-medium cursor-pointer transition-colors outline-none',
  variants: {
    selected: {
      true: 'bg-primary text-on-primary shadow-sm',
      false: 'text-text-muted hover:text-text',
    },
  },
});

export const Tabs: FC<{
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ items, value, onChange, className }) => (
  <div role="tablist" className={tabs({ className })}>
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        role="tab"
        aria-selected={value === item.id}
        className={tab({ selected: value === item.id })}
        onClick={() => onChange(item.id)}
      >
        {item.label}
      </button>
    ))}
  </div>
);
