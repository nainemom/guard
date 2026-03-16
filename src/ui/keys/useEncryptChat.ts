import { useCallback, useState } from 'react';
import { type METHODS as CODEC_METHODS, decode, encode } from '@/codec';
import { decrypt, encrypt, getPublicKey, parseKey } from '@/crypto';
import type { Key } from '@/db';

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export interface Result {
  operation: 'encrypt' | 'decrypt';
  codec: string;
  inputLabel: string;
  inputType: 'text' | 'file';
  output?: string;
  error?: string;
}

export const useEncrypt = (key: Key, _codecMethods: typeof CODEC_METHODS) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [codec, setCodec] = useState<keyof typeof CODEC_METHODS>('base64');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const parsed = parseKey(key.value);
  const canDecrypt =
    parsed.method.type === 'symmetric' || parsed.type === 'private';

  const hasInput = !!input || !!file;

  const attachFile = useCallback((f: File | null) => {
    setFile(f);
    if (f) setInput('');
  }, []);

  const updateInput = useCallback((value: string) => {
    setInput(value);
    if (value) setFile(null);
  }, []);

  const submit = useCallback(
    async (operation: 'encrypt' | 'decrypt') => {
      if (!hasInput || isProcessing) return;

      const currentFile = file;
      const currentInput = input;
      const inputLabel = currentFile
        ? `${currentFile.name} (${formatFileSize(currentFile.size)})`
        : currentInput;
      const inputType = currentFile ? ('file' as const) : ('text' as const);

      setInput('');
      setFile(null);
      setIsProcessing(true);

      try {
        let output: string;

        if (operation === 'encrypt') {
          let contentBytes: Uint8Array;
          if (currentFile) {
            contentBytes = new Uint8Array(await currentFile.arrayBuffer());
          } else {
            contentBytes = new TextEncoder().encode(currentInput);
          }
          const encryptKey =
            parsed.method.type === 'asymmetric' && parsed.type === 'private'
              ? await getPublicKey(key.value)
              : key.value;
          const encrypted = await encrypt(contentBytes, encryptKey);
          output = String(await encode(encrypted, codec));
        } else {
          const decoded = await decode(currentInput, codec);
          const decrypted = await decrypt(decoded, key.value);
          output = new TextDecoder().decode(decrypted);
        }

        setResult({ operation, codec, inputLabel, inputType, output });
      } catch (e) {
        setResult({
          operation,
          codec,
          inputLabel,
          inputType,
          error: e instanceof Error ? e.message : `${operation} failed`,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [hasInput, input, file, isProcessing, codec, parsed, key.value],
  );

  return {
    input,
    setInput: updateInput,
    file,
    attachFile,
    codec,
    setCodec,
    isProcessing,
    hasInput,
    canDecrypt,
    submit,
    result,
  };
};
