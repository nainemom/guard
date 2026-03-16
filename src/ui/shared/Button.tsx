import type { ButtonHTMLAttributes, FC } from 'react';
import { tv } from 'tailwind-variants';

const button = tv({
  base: 'inline-flex items-center justify-center gap-2 font-medium cursor-pointer disabled:opacity-40 transition-colors outline-none border rounded-lg',
  variants: {
    variant: {
      primary:
        'bg-primary border-primary hover:bg-primary-hover focus-visible:bg-primary-hover active:bg-primary text-on-primary',
      success:
        'bg-success border-success hover:bg-success/80 focus-visible:bg-success/80 active:bg-success text-on-primary',
      error:
        'bg-error border-error hover:bg-error/80 focus-visible:bg-error/80 active:bg-error text-on-error',
      ghost:
        'bg-transparent border-transparent hover:bg-surface-alt focus-visible:bg-surface-alt active:bg-transparent text-text-secondary',
      error_ghost:
        'bg-transparent border-transparent hover:bg-error/10 focus-visible:bg-error/10 active:bg-error/20 text-error',
      outline:
        'bg-transparent border-border hover:bg-surface-alt focus-visible:bg-surface-alt active:bg-transparent text-text-secondary',
    },
    iconOnly: {
      true: '',
      false: '',
    },
    size: {
      sm: 'h-6',
      md: 'h-10',
      lg: 'h-14',
    },
  },
  compoundVariants: [
    { iconOnly: true, size: 'sm', class: 'w-6' },
    { iconOnly: true, size: 'md', class: 'w-10' },
    { iconOnly: true, size: 'lg', class: 'w-14' },
    { iconOnly: false, size: 'sm', class: 'px-2 text-xs' },
    { iconOnly: false, size: 'md', class: 'px-3 text-sm' },
    { iconOnly: false, size: 'lg', class: 'px-4 text-sm' },
  ],
  defaultVariants: {
    variant: 'primary',
    iconOnly: false,
    size: 'md',
  },
});

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
    size?: 'sm' | 'md' | 'lg';
  }
> = ({ variant, iconOnly, size, className, ...props }) => (
  <button
    type="button"
    {...props}
    className={button({ variant, iconOnly, size, className })}
  />
);
