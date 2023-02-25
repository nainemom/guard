import { ReactNode } from 'react';
import Icon from '../shared/Icon';

type HeaderProps = {
  title: string,
  subtitle?: string,
  startButtons?: ReactNode,
}

export default function Header({ title, subtitle, startButtons }: HeaderProps) {
  return (
    <header className="h-16 shrink-0 flex items-center bg-section-normal text-section-content p-3 gap-3">
      { startButtons && (
        <div>
          { startButtons }
        </div>
      ) }
      <div className="flex-grow flex flex-row items-center gap-3">
        <img src={`${import.meta.env.BASE_URL}logo_white.svg`} width="48" height="48" className="w-10 h-10" />
        <div>
          { title && (<h2 className="text-xl font-semibold">{ title }</h2>) }
          { subtitle && (<p className="text-xs text-section-subtitle">{subtitle}</p>) }
        </div>
      </div>
      <a className="x-button x-button-transparent x-button-rounded x-button-lg x-button-circle" href="https://github.com/nainemom/guard" target="_blank">
        <Icon name="github" className="h-6 w-6" />
      </a>
    </header>
  )
}
