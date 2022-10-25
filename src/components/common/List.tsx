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
  clickable?: boolean,
  onMenu?: () => void,
  onClick?: () => void,
}

const listItemDefaultProps = {
  onMenu: () => {},
  onClick: () => {},
}

export function List({ children, className }: ListProps) {
  return (
    <ul class={cx('x-list', className)}>
      { children }
    </ul>
  )
}

export function ListItem(props: ListItemProps) {
  const { children, className, clickable, onClick, onMenu } = { ...listItemDefaultProps, ...props };
  const handleContextMenu = useCallback((event: Event) => {
    event.preventDefault();
    onMenu();
  }, [onMenu]);

  return (
    <li class={cx('x-list-item', clickable && 'x-list-item-clickable', className)} {...(clickable && {
      onContextMenu: handleContextMenu,
      onClick,
      tabIndex: 1,
    })}>
      { children }
    </li>
  )
}
