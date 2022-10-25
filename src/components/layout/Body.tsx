import { cx } from '@/utils/cx';
import { ComponentChildren } from 'preact';

type BodyProps = {
  children?: ComponentChildren,
  stickyArea?: ComponentChildren,
  stickyPadding?: boolean,
  className?: string,
}

export default function Body({ children, stickyArea, stickyPadding, className }: BodyProps) {
  return (
    <div className="flex-grow overflow-hidden relative contain-layout">
      <div className={cx('overflow-auto h-full', stickyArea && stickyPadding && 'pb-12', className)}>{ children }</div>
      { stickyArea && (
        <div className="fixed w-full left-0 bottom-0 p-4 h-auto flex flex-row justify-end pointer-events-none">
          <div className="pointer-events-auto">
            { stickyArea }
          </div>
        </div>
      ) }
    </div>
  )
}
