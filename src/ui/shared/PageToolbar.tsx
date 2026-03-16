import type { FC, ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const pageToolbar = tv({
  base: 'shrink-0 border-t border-border',
});

export const PageToolbar: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={pageToolbar({ className })}>{children}</div>;
