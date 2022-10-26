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
    <label className="block text-base mb-1">{ label }</label>
  ) : <></>;
}
export function FormFieldError({ error }: FormFieldErrorProps) {
  return typeof error === 'string' ? (
    <p className="text-xs mt-3 text-danger-normal">{ error }</p>
  ) : <></>;
}

export const useFormField = (formFieldProps: FormFieldProps, defaultValue: any) => {
  const formProvidedValue = useContext<FormContext | null>(formContext);

  if (!formProvidedValue) {
    return useMemo(() => [
      formFieldProps.value,
      formFieldProps.onInput || (() => {}),
      false,
    ], [formFieldProps]);
  }

  const [formValue, updateFieldValue, formErrors] = formProvidedValue;

  const fieldValue = useMemo<any>(() => {
    if (!formFieldProps.name) {
      throw new Error('Form field must have name!');
    }
    if (formValue) {
      if (Object.hasOwnProperty.call(formValue, formFieldProps.name)) {
        // @ts-ignore
        return formValue[formFieldProps.name];
      }
      return defaultValue;
    }
    return defaultValue;
  }, [formValue, formFieldProps]);

  const fieldError = useMemo(() => {
    if (!formFieldProps.name) {
      throw new Error('Form field must have name!');
    }
    if (Object.hasOwnProperty.call(formErrors, formFieldProps.name)) {
      return formErrors?.[formFieldProps.name] || false;
    }
    return false;
  }, [formErrors, formFieldProps]);

  const setFieldValue: StateUpdater<any> = useCallback((newValue: any) => {
    if (!formFieldProps.name) {
      throw new Error('Form field must have name!');
    }
    return updateFieldValue(formFieldProps.name, newValue);
  }, [updateFieldValue]);

  return useMemo(() => [
    fieldValue,
    setFieldValue,
    fieldError,
  ], [fieldValue, setFieldValue, fieldError]);
}