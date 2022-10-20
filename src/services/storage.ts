import { STORAGE_PREFIX } from '@/constants';
import { createEventTarget } from '@/utils/events';
import { StateUpdater, useCallback, useEffect, useState } from 'preact/hooks';

const eventTarget = createEventTarget();
export const on = eventTarget.on;
export const off = eventTarget.off;

export const get = (key: string) => {
  try {
    const rawValue = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (rawValue === null) {
      return null;
    }
    return JSON.parse(rawValue);
  } catch (_e) {
    return null;
  }
};

export const set = (key: string, newValue: any) => {
  const newRawValue = JSON.stringify(newValue);
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, newRawValue);
  eventTarget.emit(`update:${key}`, newValue);
  return newRawValue;
};

export const useStorage = <T>(key: string): [T, StateUpdater<T>] => {
  const [value, setValue] = useState<T>(get(key));

  const handleStorageUpdate = useCallback((event: CustomEventInit) => {
    setValue(event.detail);
  }, [setValue]);

  useEffect(() => {
    on(`update:${key}`, handleStorageUpdate);
    return () => {
      off(`update:${key}`, handleStorageUpdate);
    };
  }, [setValue]);

  useEffect(() => {
    set(key, value);
  }, [value]);

  return [value, setValue];
}