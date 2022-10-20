import { cx } from '@/utils/cx';
import { ComponentChildren, createContext } from 'preact';
import { StateUpdater, useCallback, useContext, useEffect, useMemo, useState } from 'preact/hooks';

export type FormData = {};

export type FormErrors = {
  [key: string]: boolean | string,
};

type FormContext = [
  FormData,
  (key: string, value: any) => void,
  FormErrors,
];

type FormProps = {
  children?: ComponentChildren,
  className?: string,
  value: FormData | null,
  onInput: (newValue: FormData) => void,
  onSubmit?: (formData: FormData) => void,
  validator?: (formData: FormData) => FormErrors,
}

export type FormFieldLabelProps = {
  label?: string,
}

export type FormFieldErrorProps = {
  error?: string,
}

export type FormFieldProps = FormFieldLabelProps & {
  name?: string,
  info?: string,
  value?: any,
  onInput?: (newValue: any) => void,
}

const formContext = createContext<FormContext | null>(null);

export default function Form({ children, className, value, onInput, onSubmit, validator }: FormProps) {
  const [formValue, setFormValue] = useState<FormData>(value || {});
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    onInput(formValue);
    // setFormErrors({});
  }, [formValue]);

  useEffect(() => {
    if (value) {
      setFormValue(value);
    }
  }, [value]);

  const updateFieldValue = useCallback((key: string, newValue: any) => {
    setFormValue((prevState) => ({
      ...prevState,
      [key]: newValue,
    }));
  }, [setFormValue]);

  const providerValue = useMemo<FormContext>(() => [
    formValue,
    updateFieldValue,
    formErrors,
  ], [formValue, updateFieldValue, formErrors]);

  const handleSubmit = useCallback((event: Event) => {
    event.preventDefault();
    if (validator) {
      const activeErrors = validator(formValue);
      if (Object.keys(activeErrors).length > 0) {
        setFormErrors(activeErrors);
        return;
      }
    }
    if (onSubmit) {
      onSubmit(formValue);
    }
  }, [formValue, onSubmit]);

  return (
    <formContext.Provider value={providerValue}>
      <form onSubmit={handleSubmit} className={cx(className)}>
        { children }
      </form>
    </formContext.Provider>
  )
}

export function FormFieldLabel({ label }: FormFieldLabelProps) {
  return typeof label === 'string' ? (
    <label className="block text-sm mb-2">{ label }</label>
  ) : <></>;
}
export function FormFieldError({ error }: FormFieldErrorProps) {
  return typeof error === 'string' ? (
    <p className="text-xs mt-2 text-danger-normal">{ error }</p>
  ) : <></>;
}

export const useFormField = (formFieldProps: FormFieldProps, defaultValue: any) => {
  const formProvidedValue = useContext<FormContext | null>(formContext);

  if (!formProvidedValue) {
    throw new Error('useFormField is not in context!');
  }

  const [formValue, updateFieldValue, formErrors] = formProvidedValue;

  const fieldValue = useMemo<any>(() => {
    if (formValue) {
      if (formFieldProps.name && Object.hasOwnProperty.call(formValue, formFieldProps.name)) {
        // @ts-ignore
        return formValue[formFieldProps.name] || defaultValue;
      }
      return formFieldProps.value;
    }
    return defaultValue;
  }, [formValue, formFieldProps]);

  const fieldError = useMemo(() => {
    if (formFieldProps.name && Object.hasOwnProperty.call(formErrors, formFieldProps.name)) {
      return formErrors?.[formFieldProps.name] || false;
    }
  }, [formErrors, formFieldProps]);

  const setFieldValue: StateUpdater<any> = useCallback((newValue: any) => {
    if (formFieldProps.name) {
      return updateFieldValue(formFieldProps.name, newValue);
    }
    return formFieldProps.onInput || (() => {});
  }, [updateFieldValue]);

  return useMemo(() => [
    fieldValue,
    setFieldValue,
    fieldError,
  ], [fieldValue, setFieldValue, fieldError]);
}