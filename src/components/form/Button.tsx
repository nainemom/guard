import './Button.css';
import { cx } from '@/utils/cx';
import { MouseEventHandler, ReactNode } from 'react';

type ButtonProps = {
  children?: ReactNode,
  className?: string,
  type?: 'submit' | 'button',
  theme?: 'default' | 'primary' | 'ghost' | 'danger' | 'transparent',
  rounded?: true | false,
  size?: 'sm' | 'md' | 'lg',
  circle?: boolean,
  disabled?: boolean,
  onClick?: MouseEventHandler<HTMLButtonElement>,
}

const buttonDefaultProps: ButtonProps = {
  type: 'button',
  theme: 'default',
  size: 'md',
  rounded: true,
};

export default function Button(props: ButtonProps) {
  const { children, className, type, theme, size, circle, rounded, disabled, onClick } = { ...buttonDefaultProps, ...props };
  return (
    <button
      className={cx('x-button', `x-button-${theme}`, rounded && 'x-button-rounded', `x-button-${size}`, circle && 'x-button-circle', className)}
      type={type}
      disabled={disabled}
      onClick={() => console.log('s')}
      {...(onClick && {
        onClick,
      })}
    >
      { children }
    </button>
  )
}
