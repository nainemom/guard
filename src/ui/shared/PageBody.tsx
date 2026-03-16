import type { FC, ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const pageBody = tv({
  base: 'flex-1 flex flex-col overflow-y-auto',
});

export const PageBody: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={pageBody({ className })}>{children}</div>;
