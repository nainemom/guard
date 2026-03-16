import {
  type FC,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  useCallback,
  useRef,
} from 'react';
import { tv } from 'tailwind-variants';

const input = tv({
  base: 'block w-full rounded-lg border border-border bg-surface text-text px-3 py-2 min-h-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors',
  variants: {
    multiline: {
      true: 'resize-none',
    },
  },
});

type InputProps =
  | ({
      multiline: true;
      autoGrow?: number;
    } & TextareaHTMLAttributes<HTMLTextAreaElement>)
  | ({
      multiline?: false;
      autoGrow?: never;
    } & InputHTMLAttributes<HTMLInputElement>);

export const Input: FC<InputProps> = ({
  multiline,
  autoGrow,
  className,
  ...props
}) => {
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
        className={input({ multiline: true, className })}
      />
    );
  }
  return (
    <input
      dir="auto"
      {...(props as InputHTMLAttributes<HTMLInputElement>)}
      className={input({ className })}
    />
  );
};
