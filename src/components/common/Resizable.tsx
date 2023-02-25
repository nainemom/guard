import './Resizable.css';
import { cx } from '@/utils/cx';
import { ReactNode } from 'react';

type ResizableProps = {
  children?: ReactNode,
  className?: string,
}

type ResizableSectionProps = {
  children?: ReactNode,
  className?: string,
}

export function Resizable({ children, className }: ResizableProps) {
  return (
    <div className={cx('x-resizable', className)}>
      { children }
    </div>
  )
}

export function ResizableSection({ children, className }: ResizableSectionProps) {
  return (
    <div className={cx('x-resizable-section', className)}>
      { children }
    </div>
  )
}