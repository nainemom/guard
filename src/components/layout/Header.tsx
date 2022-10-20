import { ComponentChildren } from 'preact';

type HeaderProps = {
  title: string,
  subtitle?: string,
  startButtons?: ComponentChildren,
  endButtons?: ComponentChildren,
}

export default function Header({ title, subtitle, startButtons, endButtons }: HeaderProps) {
  return (
    <header class="h-16 shrink-0 flex items-center bg-zinc-900 px-4 gap-4">
      { startButtons && (
        <div>
          { startButtons }
        </div>
      ) }
      <div class="flex-grow">
        { title && (<h2 class="text-xl font-semibold">{ title }</h2>) }
        { subtitle && (<p class="text-xs font-light text-zinc-200">{ subtitle }</p>) }
      </div>
      { endButtons && (
        <div>
          { endButtons }
        </div>
      ) }
    </header>
  )
}