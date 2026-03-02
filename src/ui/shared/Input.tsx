import { clsx } from 'clsx';
import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  useCallback,
  useRef,
} from 'react';

const baseClasses =
  'block w-full rounded-lg border border-border bg-surface text-text px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors';

type InputProps =
  | ({
      multiline: true;
      autoGrow?: number;
    } & TextareaHTMLAttributes<HTMLTextAreaElement>)
  | ({
      multiline?: false;
      autoGrow?: never;
    } & InputHTMLAttributes<HTMLInputElement>);

export const Input = ({
  multiline,
  autoGrow,
  className,
  ...props
}: InputProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const initialHeight = useRef<number>(0);

  const handleInput = useCallback<
    NonNullable<TextareaHTMLAttributes<HTMLTextAreaElement>['onInput']>
  >(
    (e) => {
      const el = e.currentTarget;
      if (!initialHeight.current) {
        initialHeight.current = el.offsetHeight;
      }
      el.style.height = 'auto';
      el.style.height = `${Math.max(initialHeight.current, Math.min(el.scrollHeight, autoGrow ?? 0))}px`;
      (props as TextareaHTMLAttributes<HTMLTextAreaElement>).onInput?.(e);
    },
    [autoGrow, props.onInput],
  );

  if (multiline) {
    const { onInput, value, ...rest } =
      props as TextareaHTMLAttributes<HTMLTextAreaElement>;

    if (autoGrow && ref.current && !value) {
      ref.current.style.height = 'auto';
    }

    return (
      <textarea
        dir="auto"
        ref={autoGrow ? ref : undefined}
        {...rest}
        value={value}
        onInput={autoGrow ? handleInput : onInput}
        className={clsx(baseClasses, 'resize-none', className)}
      />
    );
  }
  return (
    <input
      dir="auto"
      {...(props as InputHTMLAttributes<HTMLInputElement>)}
      className={clsx(baseClasses, className)}
    />
  );
};
