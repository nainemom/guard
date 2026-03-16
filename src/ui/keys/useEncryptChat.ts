import { useCallback, useState } from 'react';
import { type METHODS as CODEC_METHODS, decode, encode } from '@/codec';
import { decrypt, encrypt, getPublicKey, parseKey } from '@/crypto';
import type { Key } from '@/db';

export interface Result {
  operation: 'encrypt' | 'decrypt';
  codec: string;
  input: string;
  output?: string;
  error?: string;
}

export const useEncrypt = (key: Key, _codecMethods: typeof CODEC_METHODS) => {
  const [input, setInput] = useState('');
  const [codec, setCodec] = useState<keyof typeof CODEC_METHODS>('base64');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const parsed = parseKey(key.value);
  const canDecrypt =
    parsed.method.type === 'symmetric' || parsed.type === 'private';

  const submit = useCallback(
    async (operation: 'encrypt' | 'decrypt') => {
      if (!input || isProcessing) return;

      const rawInput = input;
      setInput('');
      setIsProcessing(true);

      try {
        let output: string;

        if (operation === 'encrypt') {
          const contentBytes = new TextEncoder().encode(rawInput);
          const encryptKey =
            parsed.method.type === 'asymmetric' && parsed.type === 'private'
              ? await getPublicKey(key.value)
              : key.value;
          const encrypted = await encrypt(contentBytes, encryptKey);
          output = String(await encode(encrypted, codec));
        } else {
          const decoded = await decode(rawInput, codec);
          const decrypted = await decrypt(decoded, key.value);
          output = new TextDecoder().decode(decrypted);
        }

        setResult({ operation, codec, input: rawInput, output });
      } catch (e) {
        setResult({
          operation,
          codec,
          input: rawInput,
          error: e instanceof Error ? e.message : `${operation} failed`,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [input, isProcessing, codec, parsed, key.value],
  );

  return {
    input,
    setInput,
    codec,
    setCodec,
    isProcessing,
    canDecrypt,
    submit,
    result,
  };
};
