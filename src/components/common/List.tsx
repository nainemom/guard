import './List.css';
import { cx } from '@/utils/cx';
import { ReactNode, useCallback, MouseEventHandler, MouseEvent } from 'react';

type ListProps = {
  children?: ReactNode,
  className?: string,
}

type ListItemProps = {
  children?: ReactNode,
  className?: string,
  clickable?: boolean,
  selected?: boolean,
  onMenu?: MouseEventHandler<HTMLLIElement>,
  onClick?: MouseEventHandler<HTMLLIElement>,
}

const listItemDefaultProps = {
  onMenu: () => {},
  onClick: () => {},
}

export function List({ children, className }: ListProps) {
  return (
    <ul className={cx('x-list', className)}>
      { children }
    </ul>
  )
}

export function ListItem(props: ListItemProps) {
  const { children, className, clickable, selected, onClick, onMenu } = { ...listItemDefaultProps, ...props };
  const handleContextMenu = useCallback((event: MouseEvent<HTMLLIElement>) => {
    event.preventDefault();
    onMenu(event);
  }, [onMenu]);

  return (
    <li
      className={cx('x-list-item', clickable && 'x-list-item-clickable', selected && 'x-list-item-selected', className)}
      {...(clickable && {
        onContextMenu: handleContextMenu,
        onClick,
        tabIndex: 1,
      })}
    >
      { children }
    </li>
  )
}
