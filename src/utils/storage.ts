import { useEffect, useMemo, useState } from 'react';

export const useStorage = <T>(
  key: string,
  defaultValue: T | null,
): [T | null, (x: T) => void] => {
  const getLatestValue = () => {
    const storageValue = localStorage.getItem(key);
    let newValue;
    try {
      if (storageValue === null) {
        newValue = defaultValue;
      } else {
        newValue = JSON.parse(storageValue);
      }
    } catch(_e) {
      newValue = defaultValue;
    } finally {
      return newValue;
    }
  };

  const [localValue, setLocalValue] = useState<T | null>(getLatestValue());

  const handleStorageUpdate = () => setLocalValue(getLatestValue());

  const setStorageValue = (newValue: T | null) => {
    if (newValue === null) {
      localStorage.removeItem(key);
    } else {
      const newStorageValue = JSON.stringify(newValue);
      localStorage.setItem(key, newStorageValue);
    }
    
    window.dispatchEvent(new StorageEvent('storage', {
      key,
    }));
  }

  useEffect(() => {
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  return useMemo(() => [localValue, setStorageValue], [localValue]);
}