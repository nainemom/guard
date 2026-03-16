import type { FC, ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const listItem = tv({
  base: [
    'flex items-center gap-3 p-3 min-h-18 w-full h-auto',
    '*:shrink-0',
    'outline-none bg-surface transition-colors',
    'cursor-pointer hover:bg-surface-alt focus-visible:bg-surface-alt active:bg-surface',
  ],
});

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
      className={listItem({ className })}
      {...(onClick ? { type: 'button' as const, onClick } : {})}
    >
      {before}
      <div className="min-w-0 grow text-start flex-1">{children}</div>
      {after}
    </Tag>
  );
};
