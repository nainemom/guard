import './Input.css';
import { cx } from '@/utils/cx';
import { useMemo } from 'preact/hooks';
import { FormFieldProps, FormFieldLabel, useFormField, FormFieldError } from './Form';

type InputProps = FormFieldProps & {
  className?: string,
  placeholder?: string,
  readOnly?: boolean,
  multiLine?: boolean,
}

export default function Input({ className, placeholder, readOnly, multiLine, ...formFieldProps }: InputProps) {
  const [value, setValue, fieldError] = useFormField(formFieldProps, '');

  const Tag = useMemo(() => multiLine ? 'textarea' : 'input', [multiLine]);

  return (
    <div>
      <FormFieldLabel label={formFieldProps.label} />
      <Tag
        class={cx('input', className)}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onInput={(e) => setValue((e?.target as HTMLInputElement)?.value)}
      />
      <FormFieldError error={fieldError} />
    </div>
  )
}
