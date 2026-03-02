import { clsx } from 'clsx';
import type { FC, ReactNode } from 'react';

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
  <div
    className={clsx(
      'flex',
      position === 'end' ? 'justify-end' : 'justify-start',
    )}
  >
    <div
      className={clsx(
        'max-w-[80%] rounded-2xl px-4 py-2',
        position === 'end' && 'rounded-br-sm bg-primary text-on-primary',
        position === 'start' &&
          variant === 'default' &&
          'rounded-bl-sm bg-surface-alt',
        position === 'start' &&
          variant === 'error' &&
          'rounded-bl-sm bg-error-light border border-error/20 text-error',
        className,
      )}
    >
      {header && <div className="text-xs opacity-70 mb-1">{header}</div>}
      <div dir="auto" className="break-all whitespace-pre-wrap text-sm">
        {children}
      </div>
      {footer && <div className="flex justify-end mt-1">{footer}</div>}
    </div>
  </div>
);
