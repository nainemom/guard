import './Resizable.css';
import { cx } from '@/utils/cx';
import { ComponentChildren } from 'preact';

type ResizableProps = {
  children?: ComponentChildren,
  className?: string,
}

type ResizableSectionProps = {
  children?: ComponentChildren,
  className?: string,
}

export function Resizable({ children, className }: ResizableProps) {
  return (
    <div class={cx('x-resizable', className)}>
      { children }
    </div>
  )
}

export function ResizableSection({ children, className }: ResizableSectionProps) {
  return (
    <div class={cx('x-resizable-section', className)}>
      { children }
    </div>
  )
}