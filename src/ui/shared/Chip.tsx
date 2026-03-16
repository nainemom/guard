import type { FC, ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const chip = tv({
  base: 'inline-flex items-center gap-1 px-2 h-6 rounded-full text-xs font-medium bg-surface-alt text-text-secondary',
});

export const Chip: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <span className={chip({ className })}>{children}</span>
);
