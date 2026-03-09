import { useCallback, useRef, useState } from 'react';

export const useCopy = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const copy = useCallback((value: string, key?: string) => {
    clearTimeout(timerRef.current);
    navigator.clipboard.writeText(value);
    setCopiedKey(key ?? value);
    timerRef.current = setTimeout(() => setCopiedKey(null), 1000);
  }, []);

  return { copiedKey, copy };
};
