import type { FC, ReactNode } from 'react';

export const Page: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="flex flex-col h-full bg-surface">{children}</div>
);
