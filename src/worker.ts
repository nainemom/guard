import { decode, encode, type METHODS } from '@/codec';
import { decrypt, encrypt, getPublicKey, parseKey } from '@/crypto';

type CodecMethod = keyof typeof METHODS;

type Request =
  | {
      id: number;
      type: 'encrypt';
      content: Uint8Array;
      keyValue: string;
      codec: CodecMethod;
    }
  | {
      id: number;
      type: 'decrypt';
      input: string | File;
      keyValue: string;
      codec: CodecMethod;
    };

self.onmessage = async (e: MessageEvent<Request>) => {
  const msg = e.data;
  try {
    switch (msg.type) {
      case 'encrypt': {
        const parsed = parseKey(msg.keyValue);
        const encryptKey =
          parsed.method.type === 'asymmetric' && parsed.type === 'private'
            ? await getPublicKey(msg.keyValue)
            : msg.keyValue;
        const encrypted = await encrypt(msg.content, encryptKey);
        const encoded = await encode(encrypted, msg.codec);
        self.postMessage({ id: msg.id, result: encoded });
        break;
      }
      case 'decrypt': {
        const decoded = await decode(msg.input, msg.codec);
        const decrypted = await decrypt(decoded, msg.keyValue);
        self.postMessage({ id: msg.id, result: decrypted });
        break;
      }
    }
  } catch (err) {
    self.postMessage({
      id: msg.id,
      error: err instanceof Error ? err.message : 'Operation failed',
    });
  }
};
