import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, FC } from 'react';

export const Button: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?:
      | 'primary'
      | 'success'
      | 'error'
      | 'ghost'
      | 'outline'
      | 'error_ghost';
    iconOnly?: boolean;
  }
> = ({ variant = 'primary', iconOnly, className, ...props }) => (
  <button
    type="button"
    {...props}
    className={clsx(
      'inline-flex items-center justify-center gap-2 font-medium cursor-pointer disabled:opacity-40 transition-colors',
      iconOnly ? 'rounded-full shrink-0' : 'rounded-lg',
      'outline-none border',
      variant === 'primary' &&
        'bg-primary border-primary hover:bg-primary-hover focus-visible:bg-primary-hover active:bg-primary text-on-primary',
      variant === 'success' &&
        'bg-success border-success hover:bg-success/80 focus-visible:bg-success/80 active:bg-success text-on-primary',
      variant === 'error' &&
        'bg-error border-error hover:bg-error/80 focus-visible:bg-error/80 active:bg-error text-on-error',
      variant === 'ghost' &&
        'bg-transparent border-transparent hover:bg-surface-alt focus-visible:bg-surface-alt active:bg-transparent text-text-secondary',
      variant === 'error_ghost' &&
        'bg-transparent border-transparent hover:bg-error/10 focus-visible:bg-error/10 active:bg-error/20 text-error',
      variant === 'outline' &&
        'bg-transparent border-border hover:bg-surface-alt focus-visible:bg-surface-alt active:bg-transparent text-text-secondary',
      className,
    )}
  />
);
