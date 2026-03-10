import { useRef } from 'react';

export function useStale<T>(value: T): NonNullable<T> | undefined {
  const ref = useRef(value);
  if (value != null) ref.current = value;
  return ref.current ?? undefined;
}
