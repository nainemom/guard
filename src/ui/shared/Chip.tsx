import { clsx } from 'clsx';
import type { FC, ReactNode } from 'react';

export const Chip: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1 px-2 h-6 rounded-full text-xs font-medium',
      'bg-surface-alt text-text-secondary',
      className,
    )}
  >
    {children}
  </span>
);
