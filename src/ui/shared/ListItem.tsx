import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

export const ListItem: FC<{
  className?: string;
  children?: ReactNode;
  before?: ReactNode;
  after?: ReactNode;
  onClick?: () => void;
}> = ({ before, children, after, className, onClick }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={clsx(
        'flex items-center gap-3 px-4 py-2 min-h-18 w-full h-auto',
        '*:shrink-0',
        'outline-none bg-surface transition-colors',
        onClick &&
          'cursor-pointer hover:bg-surface-alt focus-visible:bg-surface-alt focus-within:bg-surface-alt active:bg-surface',
        className,
      )}
      {...(onClick ? { type: 'button' as const, onClick } : {})}
    >
      {before}
      <div className="min-w-0 grow text-start flex-1">{children}</div>
      {after}
    </Tag>
  );
};
