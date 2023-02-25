import { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode,
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-full min-h-full flex flex-col">
      { children }
    </div>
  )
}
