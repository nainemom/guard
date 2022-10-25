import './Input.css';
import { cx } from '@/utils/cx';
import { useMemo } from 'preact/hooks';
import { FormFieldProps, FormFieldLabel, useFormField, FormFieldError } from './Form';

type InputProps = FormFieldProps & {
  className?: string,
  size?: 'md' | 'manual',
  placeholder?: string,
  readOnly?: boolean,
  multiLine?: boolean,
}

const inputDefaultProps: InputProps = {
  size: 'md',
};

export default function Input(props: InputProps) {
  const { className, size, placeholder, readOnly, multiLine, ...formFieldProps } = { ...inputDefaultProps, ...props };

  const [value, setValue, fieldError] = useFormField(formFieldProps, '');

  const Tag = useMemo(() => multiLine ? 'textarea' : 'input', [multiLine]);

  return (
    <>
      <FormFieldLabel label={formFieldProps.label} />
      <Tag
        class={cx('x-input', `x-input-size-${size}`, className)}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onInput={(e) => setValue((e?.target as HTMLInputElement)?.value)}
      />
      <FormFieldError error={fieldError} />
    </>
  )
}
