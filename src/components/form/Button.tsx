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
  disabled?: boolean,
  onClick?: EventListener,
}

const buttonDefaultProps: ButtonProps = {
  type: 'button',
  theme: 'default',
  size: 'md',
};

export default function Button(props: ButtonProps) {
  const { children, className, type, theme, size, circle, disabled, onClick } = { ...buttonDefaultProps, ...props };
  return (
    <button
      class={cx('x-button', `x-button-${theme}`, `x-button-${size}`, circle && 'x-button-circle', className)}
      type={type}
      disabled={disabled}
      {...(onClick && {
        onClick,
      })}
    >
      { children }
    </button>
  )
}
