import type { FC, ReactNode } from 'react';

export const PageToolbar: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={`shrink-0 border-t border-border ${className ?? ''}`}>
    {children}
  </div>
);
