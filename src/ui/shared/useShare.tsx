import { CheckCircle, CopySimple, ShareNetwork } from '@phosphor-icons/react';
import { type ReactNode, useCallback, useRef, useState } from 'react';

const canNativeShare =
  typeof navigator.share === 'function' &&
  navigator.canShare?.({ text: 'test' });

const IdleIcon = canNativeShare ? ShareNetwork : CopySimple;

type ShareData = { text: string } | { file: Uint8Array; fileName: string };

const downloadBlob = (bytes: Uint8Array, name: string) => {
  const blob = new Blob([bytes.slice()]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const useShare = () => {
  const [sharedKey, setSharedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const markShared = useCallback((key: string) => {
    clearTimeout(timerRef.current);
    setSharedKey(key);
    timerRef.current = setTimeout(() => setSharedKey(null), 1000);
  }, []);

  const share = useCallback(
    async (data: ShareData, key?: string) => {
      if ('file' in data) {
        if (canNativeShare) {
          const file = new File([data.file], data.fileName, {
            type: 'application/octet-stream',
          });
          try {
            await navigator.share({ files: [file] });
          } catch {
            // user cancelled
          }
        } else {
          downloadBlob(data.file, data.fileName);
          if (key) markShared(key);
        }
        return;
      }

      if (canNativeShare) {
        try {
          await navigator.share({ text: data.text });
        } catch {
          // user cancelled
        }
        return;
      }

      await navigator.clipboard.writeText(data.text);
      if (key) markShared(key ?? data.text);
    },
    [markShared],
  );

  const shareIcon = (key: string, size = 18, className?: string): ReactNode => {
    if (sharedKey === key) {
      return <CheckCircle size={size} className="text-success" />;
    }
    return <IdleIcon size={size} className={className} />;
  };

  return { share, shareIcon };
};
