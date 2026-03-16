import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type METHODS as CODEC_METHODS, decode, encode } from '@/codec';
import { decrypt, encrypt, getPublicKey, parseKey } from '@/crypto';
import { db, type Key, type Message, useTable } from '@/db';

export type { Message };

export const useEncryptChat = (
  key: Key,
  codecMethods: typeof CODEC_METHODS,
) => {
  const filter = useCallback((m: Message) => m.keyId === key.id, [key.id]);
  const filtered = useTable('messages', filter);
  const messages = useMemo(
    () => [...filtered].sort((a, b) => a.updatedAt - b.updatedAt),
    [filtered],
  );
  const [input, setInput] = useState('');
  const [codec, setCodec] = useState<keyof typeof CODEC_METHODS>('base64');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const parsed = parseKey(key.value);
  const canDecrypt =
    parsed.method.type === 'symmetric' || parsed.type === 'private';

  const submit = useCallback(
    async (operation: 'encrypt' | 'decrypt') => {
      if (!input.trim() || isProcessing) return;

      const codecMethod = codecMethods[codec];
      const trimmedInput = input.trim();

      setInput('');
      setIsProcessing(true);

      const delay = new Promise((r) => setTimeout(r, 300));

      try {
        let output: string;

        if (operation === 'encrypt') {
          const contentBytes = new TextEncoder().encode(trimmedInput);
          const encryptKey =
            parsed.method.type === 'asymmetric' && parsed.type === 'private'
              ? await getPublicKey(key.value)
              : key.value;
          const encrypted = await encrypt(contentBytes, encryptKey);
          const encoded = await encode(encrypted, codec);

          if (codecMethod.output === 'file') {
            const bytes = encoded as unknown as Uint8Array;
            output = `${codecMethod.name} file (${bytes.length} bytes)`;
          } else {
            output = String(encoded);
          }
        } else {
          const decoded = await decode(trimmedInput, codec);
          const decrypted = await decrypt(decoded, key.value);
          output = new TextDecoder().decode(decrypted);
        }

        await delay;
        db.add('messages', {
          keyId: key.id,
          operation,
          codec,
          input: trimmedInput,
          status: 'done' as const,
          outputType: operation === 'decrypt' ? 'string' : codecMethod.output,
          output,
        });
      } catch (e) {
        await delay;
        db.add('messages', {
          keyId: key.id,
          operation,
          codec,
          input: trimmedInput,
          status: 'error' as const,
          error: e instanceof Error ? e.message : `${operation} failed`,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [input, isProcessing, codec, codecMethods, parsed, key.value, key.id],
  );

  return {
    messages,
    input,
    setInput,
    codec,
    setCodec,
    isProcessing,
    canDecrypt,
    submit,
    scrollAnchorRef,
  };
};
