import { clsx } from 'clsx';
import type { FC, ReactNode } from 'react';

export const PageBody: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={clsx('flex-1 flex flex-col overflow-y-auto', className)}>
    {children}
  </div>
);
