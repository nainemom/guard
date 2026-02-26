import {
  createContext,
  type Dispatch,
  type FormEventHandler,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cx } from '@/utils/cx';

export type FormData = {};

export type FormErrors = {
  [key: string]: boolean | string;
};

type FormContext = [FormData, (key: string, value: any) => void, FormErrors];

type FormProps = {
  children?: ReactNode;
  className?: string;
  value: FormData | null;
  onInput: (newValue: FormData) => void;
  onSubmit?: (formData: FormData) => void;
  validator?: (formData: FormData) => FormErrors;
};

export type FormFieldLabelProps = {
  label?: string;
};

export type FormFieldErrorProps = {
  error?: string;
};

export type FormFieldProps = FormFieldLabelProps & {
  name?: string;
  info?: string;
  value?: any;
  onInput?: (newValue: any) => void;
};

const formContext = createContext<FormContext | null>(null);

export default function Form({
  children,
  className,
  value,
  onInput,
  onSubmit,
  validator,
}: FormProps) {
  const [formValue, setFormValue] = useState<FormData>(value || {});
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    onInput(formValue);
    // setFormErrors({});
  }, [formValue, onInput]);

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
  }, []);

  const providerValue = useMemo<FormContext>(
    () => [formValue, updateFieldValue, formErrors],
    [formValue, updateFieldValue, formErrors],
  );

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
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
    },
    [formValue, onSubmit, validator],
  );

  return (
    <formContext.Provider value={providerValue}>
      <form onSubmit={handleSubmit} className={cx(className)}>
        {children}
      </form>
    </formContext.Provider>
  );
}

export function FormFieldLabel({ label }: FormFieldLabelProps) {
  return typeof label === 'string' ? (
    <label className="block text-base mb-1">{label}</label>
  ) : (
    <></>
  );
}
export function FormFieldError({ error }: FormFieldErrorProps) {
  return typeof error === 'string' ? (
    <p className="text-xs mt-3 text-danger-normal">{error}</p>
  ) : (
    <></>
  );
}

export const useFormField = (
  formFieldProps: FormFieldProps,
  defaultValue: any,
) => {
  const formProvidedValue = useContext<FormContext | null>(formContext);

  if (!formProvidedValue) {
    return useMemo(
      () => [formFieldProps.value, formFieldProps.onInput || (() => {}), false],
      [formFieldProps],
    );
  }

  const [formValue, updateFieldValue, formErrors] = formProvidedValue;

  const fieldValue = useMemo<any>(() => {
    if (!formFieldProps.name) {
      throw new Error('Form field must have name!');
    }
    if (formValue) {
      if (Object.hasOwn(formValue, formFieldProps.name)) {
        // @ts-expect-error
        return formValue[formFieldProps.name];
      }
      return defaultValue;
    }
    return defaultValue;
  }, [formValue, formFieldProps, defaultValue]);

  const fieldError = useMemo(() => {
    if (!formFieldProps.name) {
      throw new Error('Form field must have name!');
    }
    if (Object.hasOwn(formErrors, formFieldProps.name)) {
      return formErrors?.[formFieldProps.name] || false;
    }
    return false;
  }, [formErrors, formFieldProps]);

  const setFieldValue: Dispatch<SetStateAction<any>> = useCallback(
    (newValue: any) => {
      if (!formFieldProps.name) {
        throw new Error('Form field must have name!');
      }
      return updateFieldValue(formFieldProps.name, newValue);
    },
    [updateFieldValue, formFieldProps.name],
  );

  return useMemo(
    () => [fieldValue, setFieldValue, fieldError],
    [fieldValue, setFieldValue, fieldError],
  );
};
