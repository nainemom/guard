import type { ButtonHTMLAttributes, FC } from 'react';
import { tv } from 'tailwind-variants';

const button = tv({
  base: 'inline-flex items-center justify-center gap-2 font-medium cursor-pointer disabled:opacity-40 transition-colors outline-none border',
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
      true: 'rounded-full shrink-0',
      false: 'rounded-lg',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    { iconOnly: true, size: 'sm', class: 'size-7' },
    { iconOnly: true, size: 'md', class: 'size-10' },
    { iconOnly: true, size: 'lg', class: 'size-14' },
    { iconOnly: false, size: 'sm', class: 'px-3 py-1.5 text-xs' },
    { iconOnly: false, size: 'md', class: 'px-4 py-2 text-sm' },
    { iconOnly: false, size: 'lg', class: 'px-4 py-3 text-sm' },
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
