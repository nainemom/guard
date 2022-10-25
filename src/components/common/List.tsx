import './List.css';
import { cx } from '@/utils/cx';
import { ComponentChildren } from 'preact';
import { useCallback } from 'preact/hooks';

type ListProps = {
  children?: ComponentChildren,
  className?: string,
}

type ListItemProps = {
  children?: ComponentChildren,
  className?: string,
  onMenu?: () => void,
}

export function List({ children, className }: ListProps) {
  return (
    <ul class={cx('x-list', className)}>
      { children }
    </ul>
  )
}

export function ListItem({ children, className, onMenu }: ListItemProps) {
  const handleContextMenu = useCallback((event: Event) => {
    if (onMenu) {
      event.preventDefault();
      onMenu();
    }
  }, [onMenu]);

  return (
    <li class={cx('x-list-item', className)} onContextMenu={handleContextMenu}>
      { children }
    </li>
  )
}
