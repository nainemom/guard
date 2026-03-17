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

export interface PanelState {
  text: string;
  file: File | null;
  error: string | null;
}

const emptyPanel: PanelState = { text: '', file: null, error: null };

export const useEncrypt = (key: Key) => {
  const [plain, setPlainState] = useState<PanelState>({
    text: '',
    file: null,
    error: null,
  });
  const [cipher, setCipherState] = useState<PanelState>({
    text: '',
    file: null,
    error: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const parsed = parseKey(key.value);
  const codec = (key.codec ?? 'base64') as Parameters<typeof encode>[1];
  const canDecrypt =
    parsed.method.type === 'symmetric' || parsed.type === 'private';

  const hasPlainInput = !!plain.text || !!plain.file;
  const hasCipherInput = !!cipher.text || !!cipher.file;

  const setPlainText = useCallback((text: string) => {
    setPlainState({ text, file: null, error: null });
    setCipherState(emptyPanel);
  }, []);

  const setPlainFile = useCallback((file: File | null) => {
    setPlainState({ text: '', file, error: null });
    setCipherState(emptyPanel);
  }, []);

  const setCipherText = useCallback((text: string) => {
    setCipherState({ text, file: null, error: null });
    setPlainState(emptyPanel);
  }, []);

  const setCipherFile = useCallback((file: File | null) => {
    setCipherState({ text: '', file, error: null });
    setPlainState(emptyPanel);
  }, []);

  const doEncrypt = useCallback(async () => {
    if (!hasPlainInput || isProcessing) return;
    setIsProcessing(true);
    setCipherState({ text: '', file: null, error: null });

    try {
      let contentBytes: Uint8Array;
      if (plain.file) {
        const raw = new Uint8Array(await plain.file.arrayBuffer());
        contentBytes = packFile(plain.file, raw);
      } else {
        contentBytes = new TextEncoder().encode(plain.text);
      }

      const encryptKey =
        parsed.method.type === 'asymmetric' && parsed.type === 'private'
          ? await getPublicKey(key.value)
          : key.value;
      const encrypted = await encrypt(contentBytes, encryptKey);
      const encoded = await encode(encrypted, codec);

      if (encoded instanceof File) {
        setCipherState({ text: '', file: encoded, error: null });
      } else {
        setCipherState({ text: String(encoded), file: null, error: null });
      }
    } catch (e) {
      setCipherState({
        text: '',
        file: null,
        error: e instanceof Error ? e.message : 'Encryption failed',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [hasPlainInput, isProcessing, plain, parsed, key.value, codec]);

  const doDecrypt = useCallback(async () => {
    if (!hasCipherInput || isProcessing) return;
    setIsProcessing(true);
    setPlainState({ text: '', file: null, error: null });

    try {
      const decodeInput = cipher.file ?? cipher.text;
      const decoded = await decode(decodeInput, codec);
      const decrypted = await decrypt(decoded, key.value);

      const unpacked = unpackFile(decrypted);
      if (unpacked) {
        const file = new File([unpacked.content as BlobPart], unpacked.name, {
          type: unpacked.type,
        });
        const text = isValidUtf8Text(unpacked.content)
          ? new TextDecoder().decode(unpacked.content)
          : '';
        setPlainState({ text, file, error: null });
      } else {
        if (isValidUtf8Text(decrypted)) {
          setPlainState({
            text: new TextDecoder().decode(decrypted),
            file: null,
            error: null,
          });
        } else {
          setPlainState({
            text: '',
            file: new File([decrypted as BlobPart], `decrypted_${Date.now()}`, {
              type: 'application/octet-stream',
            }),
            error: null,
          });
        }
      }
    } catch (e) {
      setPlainState({
        text: '',
        file: null,
        error: e instanceof Error ? e.message : 'Decryption failed',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [hasCipherInput, isProcessing, cipher, key.value, codec]);

  const clearPlain = useCallback(() => setPlainState(emptyPanel), []);
  const clearCipher = useCallback(() => setCipherState(emptyPanel), []);

  return {
    plain,
    cipher,
    isProcessing,
    canDecrypt,
    hasPlainInput,
    hasCipherInput,
    setPlainText,
    setPlainFile,
    setCipherText,
    setCipherFile,
    clearPlain,
    clearCipher,
    doEncrypt,
    doDecrypt,
  };
};
