import './Resizable.css';
import { cx } from '@/utils/cx';
import { Children, Component, ReactComponentElement, ReactElement, ReactFragment, ReactNode } from 'react';
import { List, ListItem } from './List';
import Button, { buttonDefaultProps, ButtonProps } from '../form/Button';

type MenuProps = {
  children?: ReactNode,
  className?: string,
}

type MenuItemProps = {
  children?: ReactNode,
  className?: string,
  onClick?: () => unknown
}

export function MenuActivator(props: ButtonProps) {
  const { children, className, ...rest } = { ...buttonDefaultProps, ...props };
  return (
    <Button className={cx('x-menu-activator', className)} {...rest}>
      { children }
    </Button>
  )
}

export function MenuItem({ children, className, onClick }: MenuItemProps) {
  return (
    <ListItem
      clickable
      className={cx('p-3 py-3 min-h-[4.5rem] flex flex-row items-center gap-4', className)}
      {...(onClick && {
        onClick,
      })}
    >
      { children }
    </ListItem>
  )
}

export function Menu({ children, className }: MenuProps) {
  const activator = Children.map(children, (child) => {
    return (child as ReactElement)?.type === MenuActivator ? child : null;
  });

  const items = Children.map(children, (child) => {
    return (child as ReactElement)?.type === MenuItem ? child : null;
  });
  
  return (
    <div className={cx('x-menu group', className)}>
      { activator }
      <div className="hidden group-focus-within:block absolute bg-section-normal text-section-content shadow-2xl w-80 right-0 mt-4 mr-2 rounded-xl overflow-hidden z-10">
        <List className="!gap-0">
          { items }
        </List>
      </div>
    </div>
  )
}