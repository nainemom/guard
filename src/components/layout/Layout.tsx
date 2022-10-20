import { ComponentChildren } from 'preact';

type LayoutProps = {
  children: ComponentChildren,
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div class="h-full min-h-full flex flex-col">
      { children }
    </div>
  )
}
