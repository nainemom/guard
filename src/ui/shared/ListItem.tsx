import type { FC, ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const listItem = tv({
  base: [
    'flex items-center w-full h-auto',
    '*:shrink-0',
    'outline-none bg-surface transition-colors',
    'disabled:opacity-40 disabled:pointer-events-none',
    'cursor-pointer hover:bg-surface-alt focus-visible:bg-surface-alt active:bg-surface',
  ],
  variants: {
    size: {
      sm: 'gap-2 px-3 py-1.5 min-h-10',
      md: 'gap-3 p-3 min-h-14',
      lg: 'gap-3 p-3 min-h-18',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

export const ListItem: FC<{
  className?: string;
  children?: ReactNode;
  before?: ReactNode;
  after?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}> = ({ before, children, after, className, size, onClick, disabled }) => {
  return (
    <button
      type="button"
      className={listItem({ size, className })}
      onClick={onClick}
      disabled={disabled}
    >
      {before}
      <div className="min-w-0 grow text-start flex-1">{children}</div>
      {after}
    </button>
  );
};
