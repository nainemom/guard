import { STORAGE_PREFIX } from '@/constants';
import { createEventTarget } from '@/utils/events';

const eventTarget = createEventTarget();
export const on = eventTarget.on;
export const off = eventTarget.off;

export const get = (key: string) => {
  try {
    const rawValue = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (rawValue === null) {
      return undefined;
    }
    return JSON.parse(rawValue);
  } catch (_e) {
    return undefined;
  }
};

export const set = (key: string, newValue: any) => {
  const newRawValue = JSON.stringify(newValue);
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, newRawValue);
  eventTarget.emit(`update:${key}`, newValue);
  return newRawValue;
};