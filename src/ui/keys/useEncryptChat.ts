import { useCallback, useState } from 'react';
import { decode, encode } from '@/codec';
import { decrypt, encrypt, getPublicKey, parseKey } from '@/crypto';
import type { Key } from '@/db';

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isValidUtf8Text = (bytes: Uint8Array): boolean => {
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    // biome-ignore lint/suspicious/noControlCharactersInRegex: intentionally detecting control chars
    return !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text);
  } catch {
    return false;
  }
};

const packFile = (file: File, content: Uint8Array): Uint8Array => {
  const meta = new TextEncoder().encode(
    JSON.stringify({ name: file.name, type: file.type }),
  );
  const result = new Uint8Array(2 + meta.length + content.length);
  new DataView(result.buffer).setUint16(0, meta.length, false);
  result.set(meta, 2);
  result.set(content, 2 + meta.length);
  return result;
};

const unpackFile = (
  data: Uint8Array,
): { name: string; type: string; content: Uint8Array } | null => {
  if (data.length < 2) return null;
  const metaLen = new DataView(
    data.buffer,
    data.byteOffset,
    data.byteLength,
  ).getUint16(0, false);
  if (data.length < 2 + metaLen) return null;
  try {
    const meta = JSON.parse(
      new TextDecoder().decode(data.slice(2, 2 + metaLen)),
    );
    if (!meta.name || typeof meta.name !== 'string') return null;
    return {
      name: meta.name,
      type: meta.type ?? 'application/octet-stream',
      content: data.slice(2 + metaLen),
    };
  } catch {
    return null;
  }
};

export interface Result {
  operation: 'encrypt' | 'decrypt';
  inputLabel: string;
  inputType: 'text' | 'file';
  inputFile?: File;
  output?: string;
  outputFile?: File;
  error?: string;
}

export const useEncrypt = (key: Key) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const parsed = parseKey(key.value);
  const codec = (key.codec ?? 'base64') as Parameters<typeof encode>[1];
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
        let output: string | undefined;
        let outputFile: File | undefined;

        if (operation === 'encrypt') {
          let contentBytes: Uint8Array;
          if (currentFile) {
            const raw = new Uint8Array(await currentFile.arrayBuffer());
            contentBytes = packFile(currentFile, raw);
          } else {
            contentBytes = new TextEncoder().encode(currentInput);
          }
          const encryptKey =
            parsed.method.type === 'asymmetric' && parsed.type === 'private'
              ? await getPublicKey(key.value)
              : key.value;
          const encrypted = await encrypt(contentBytes, encryptKey);
          const encoded = await encode(encrypted, codec);
          if (encoded instanceof File) {
            outputFile = encoded;
          } else {
            output = String(encoded);
          }
        } else {
          const decodeInput = currentFile ?? currentInput;
          const decoded = await decode(decodeInput, codec);
          const decrypted = await decrypt(decoded, key.value);

          const unpacked = unpackFile(decrypted);
          if (unpacked) {
            outputFile = new File([unpacked.content], unpacked.name, {
              type: unpacked.type,
            });
            if (isValidUtf8Text(unpacked.content)) {
              output = new TextDecoder().decode(unpacked.content);
            }
          } else {
            if (isValidUtf8Text(decrypted)) {
              output = new TextDecoder().decode(decrypted);
            }
            outputFile = new File([decrypted], `decrypted_${Date.now()}`, {
              type: 'application/octet-stream',
            });
          }
        }

        setResult({
          operation,
          inputLabel,
          inputType,
          inputFile: currentFile ?? undefined,
          output,
          outputFile,
        });
      } catch (e) {
        setResult({
          operation,
          inputLabel,
          inputType,
          inputFile: currentFile ?? undefined,
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
    isProcessing,
    hasInput,
    canDecrypt,
    submit,
    result,
  };
};
