import type { FC, ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const wrapper = tv({
  base: 'flex',
  variants: {
    position: {
      start: 'justify-start',
      end: 'justify-end',
    },
  },
});

const bubble = tv({
  base: 'max-w-[80%] rounded-2xl px-4 py-2',
  variants: {
    position: {
      start: 'rounded-bl-sm',
      end: 'rounded-br-sm bg-primary text-on-primary',
    },
    variant: {
      default: '',
      error: '',
    },
  },
  compoundVariants: [
    { position: 'start', variant: 'default', class: 'bg-surface-alt' },
    {
      position: 'start',
      variant: 'error',
      class: 'bg-error-light border border-error/20 text-error',
    },
  ],
  defaultVariants: {
    position: 'start',
    variant: 'default',
  },
});

export const ChatBubble: FC<{
  children: ReactNode;
  position?: 'start' | 'end';
  variant?: 'default' | 'error';
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}> = ({
  children,
  position = 'start',
  variant = 'default',
  header,
  footer,
  className,
}) => (
  <div className={wrapper({ position })}>
    <div className={bubble({ position, variant, className })}>
      {header && <div className="text-xs opacity-70 mb-1">{header}</div>}
      <div dir="auto" className="whitespace-normal wrap-anywhere text-sm">
        {children}
      </div>
      {footer && <div className="flex justify-end mt-1">{footer}</div>}
    </div>
  </div>
);
