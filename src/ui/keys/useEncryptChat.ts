import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type METHODS as CODEC_METHODS, decode, encode } from '@/codec';
import { decrypt, encrypt, getPublicKey, parseKey } from '@/crypto';
import { db, type Key, type Message } from '@/db';

export type { Message };

export const useEncryptChat = (
  key: Key,
  codecMethods: typeof CODEC_METHODS,
) => {
  const messages = useLiveQuery(
    () => db.messages.where('keyId').equals(key.id).sortBy('createdAt'),
    [key.id],
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
        await db.messages.add({
          keyId: key.id,
          operation,
          codec,
          input: trimmedInput,
          status: 'done',
          outputType: operation === 'decrypt' ? 'string' : codecMethod.output,
          output,
        } as Message);
      } catch (e) {
        await delay;
        await db.messages.add({
          keyId: key.id,
          operation,
          codec,
          input: trimmedInput,
          status: 'error',
          error: e instanceof Error ? e.message : `${operation} failed`,
        } as Message);
      } finally {
        setIsProcessing(false);
      }
    },
    [input, isProcessing, codec, codecMethods, parsed, key.value, key.id],
  );

  return {
    messages: messages ?? [],
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
