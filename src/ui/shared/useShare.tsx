import { Copy01Icon, Share01Icon } from '@hugeicons/core-free-icons';
import { useCallback } from 'react';
import { useToast } from './Toast';

const canNativeShare =
  typeof navigator.share === 'function' &&
  navigator.canShare?.({ text: 'test' });

export const shareIcon = canNativeShare ? Share01Icon : Copy01Icon;

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
  const toast = useToast();

  const share = useCallback(
    async (data: ShareData) => {
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
          toast.show('File downloaded');
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
      toast.show('Copied to clipboard');
    },
    [toast],
  );

  return { share };
};
