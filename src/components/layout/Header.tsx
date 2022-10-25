import { ComponentChildren } from 'preact';

type HeaderProps = {
  title: string,
  subtitle?: string,
  startButtons?: ComponentChildren,
  endButtons?: ComponentChildren,
}

export default function Header({ title, subtitle, startButtons, endButtons }: HeaderProps) {
  return (
    <header class="h-16 shrink-0 flex items-center bg-section-normal text-section-content px-4 gap-4">
      { startButtons && (
        <div>
          { startButtons }
        </div>
      ) }
      <div class="flex-grow">
        { title && (<h2 class="text-2xl font-semibold">{ title }</h2>) }
      </div>
      { endButtons && (
        <div>
          { endButtons }
        </div>
      ) }
    </header>
  )
}