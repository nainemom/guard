import { useCallback, useEffect, useRef, useState } from 'react';
import { type METHODS as CODEC_METHODS, decode, encode } from '@/codec';
import { decrypt, encrypt, getPublicKey, parseKey } from '@/crypto';
import type { Key } from '@/db';

interface Message {
  id: string;
  operation: 'encrypt' | 'decrypt';
  codec: keyof typeof CODEC_METHODS;
  input: string;
  status: 'processing' | 'done' | 'error';
  outputType?: 'string' | 'file';
  output?: string;
  outputBytes?: Uint8Array;
  error?: string;
}

export type { Message };

export const useEncryptChat = (
  key: Key,
  codecMethods: typeof CODEC_METHODS,
) => {
  const [messages, setMessages] = useState<Message[]>([]);
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

      const msgId = crypto.randomUUID();
      const codecMethod = codecMethods[codec];
      const newMessage: Message = {
        id: msgId,
        operation,
        codec,
        input: input.trim(),
        status: 'processing',
        outputType: operation === 'decrypt' ? 'string' : codecMethod.output,
      };

      setMessages((prev) => [...prev, newMessage]);
      setInput('');
      setIsProcessing(true);

      const delay = new Promise((r) => setTimeout(r, 300));

      try {
        let output: string;
        let outputBytes: Uint8Array | undefined;

        if (operation === 'encrypt') {
          const contentBytes = new TextEncoder().encode(newMessage.input);
          const encryptKey =
            parsed.method.type === 'asymmetric' && parsed.type === 'private'
              ? await getPublicKey(key.value)
              : key.value;
          const encrypted = await encrypt(contentBytes, encryptKey);
          const encoded = await encode(encrypted, codec);

          if (codecMethod.output === 'file') {
            outputBytes = encoded as unknown as Uint8Array;
            output = `${codecMethod.name} file (${outputBytes.length} bytes)`;
          } else {
            output = String(encoded);
          }
        } else {
          const decoded = await decode(newMessage.input, codec);
          const decrypted = await decrypt(decoded, key.value);
          output = new TextDecoder().decode(decrypted);
        }

        await delay;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? { ...m, status: 'done' as const, output, outputBytes }
              : m,
          ),
        );
      } catch (e) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  status: 'error' as const,
                  error: e instanceof Error ? e.message : `${operation} failed`,
                }
              : m,
          ),
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [input, isProcessing, codec, codecMethods, parsed, key.value],
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
