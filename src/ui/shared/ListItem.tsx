import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

export const ListItem: FC<{
  className?: string;
  children?: ReactNode;
  before?: ReactNode;
  after?: ReactNode;
  onClick?: () => void;
}> = ({ before, children, after, className, onClick }) => {
  return (
    <button
      className={clsx(
        'flex items-center gap-3 px-4 py-2 min-h-18 h-auto cursor-pointer',
        '*:shrink-0',
        'outline-none bg-surface hover:bg-surface-alt focus-visible:bg-surface-alt focus-within:bg-surface-alt active:bg-surface transition-colors',
        className,
      )}
      type="button"
      onClick={onClick}
    >
      {before}
      <div className="flex-1 min-w-0">{children}</div>
      {after}
    </button>
  );
};
