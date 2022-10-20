import './Button.css';
import { cx } from '@/utils/cx';
import { ComponentChildren } from 'preact';

type ButtonProps = {
  children?: ComponentChildren,
  className?: string,
  type?: 'submit' | 'button',
  theme?: 'default' | 'primary' | 'ghost' | 'danger',
  size?: 'sm' | 'md' | 'lg',
  circle?: boolean,
  onClick?: EventListener,
}

const buttonDefaultProps: ButtonProps = {
  type: 'button',
  theme: 'default',
  size: 'md',
};

export default function Button(props: ButtonProps) {
  const { children, className, type, theme, size, circle, onClick } = { ...buttonDefaultProps, ...props };
  return (
    <button
      class={cx('button', `button-${theme}`, `button-${size}`, circle && 'button-circle', className)}
      type={type}
      {...(onClick && {
        onClick,
      })}
    >
      { children }
    </button>
  )
}
