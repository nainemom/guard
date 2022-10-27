import { ComponentChildren } from 'preact';

type HeaderProps = {
  title: string,
  subtitle?: string,
  startButtons?: ComponentChildren,
  endButtons?: ComponentChildren,
}

export default function Header({ title, subtitle, startButtons, endButtons }: HeaderProps) {
  return (
    <header class="h-16 shrink-0 flex items-center bg-section-normal text-section-content p-3 gap-3">
      { startButtons && (
        <div>
          { startButtons }
        </div>
      ) }
      <div class="flex-grow flex flex-row items-center gap-3">
        <img src="/logo_white.svg" width="48" height="48" className="w-10 h-10" />
        <div>
          { title && (<h2 class="text-xl font-semibold">{ title }</h2>) }
          { subtitle && (<p className="text-xs text-section-subtitle">{subtitle}</p>) }
        </div>
      </div>
      { endButtons && (
        <div>
          { endButtons }
        </div>
      ) }
    </header>
  )
}
