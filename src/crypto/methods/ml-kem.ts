import { gcm } from '@noble/ciphers/aes.js';
import { concatBytes } from '@noble/ciphers/utils.js';
import { sha256 } from '@noble/hashes/sha2.js';
import {
  ml_kem512,
  ml_kem768,
  ml_kem1024,
} from '@noble/post-quantum/ml-kem.js';
import type { MethodHandler } from '../types';

interface KEMAlgorithm {
  keygen(): { publicKey: Uint8Array; secretKey: Uint8Array };
  encapsulate(publicKey: Uint8Array): {
    cipherText: Uint8Array;
    sharedSecret: Uint8Array;
  };
  decapsulate(cipherText: Uint8Array, secretKey: Uint8Array): Uint8Array;
}

interface KEMConfig {
  name: string;
  description: string;
  kem: KEMAlgorithm;
  publicKeySize: number;
  cipherTextSize: number;
}

const KEM_CONFIGS = {
  'ml-kem-512': {
    name: 'ML-KEM-512',
    description:
      'Post-quantum KEM encapsulation + AES-256-GCM. 128-bit security.',
    kem: ml_kem512,
    publicKeySize: 800,
    cipherTextSize: 768,
  } satisfies KEMConfig,
  'ml-kem-768': {
    name: 'ML-KEM-768',
    description:
      'Post-quantum KEM encapsulation + AES-256-GCM. 192-bit security.',
    kem: ml_kem768,
    publicKeySize: 1184,
    cipherTextSize: 1088,
  } satisfies KEMConfig,
  'ml-kem-1024': {
    name: 'ML-KEM-1024',
    description:
      'Post-quantum KEM encapsulation + AES-256-GCM. 256-bit security.',
    kem: ml_kem1024,
    publicKeySize: 1568,
    cipherTextSize: 1568,
  } satisfies KEMConfig,
};

function createKEMHandler(id: keyof typeof KEM_CONFIGS): MethodHandler {
  const { kem, publicKeySize, cipherTextSize, name, description } =
    KEM_CONFIGS[id];

  return {
    id,
    type: 'asymmetric',
    category: 'post-quantum',
    name,
    description,

    async generatePrivateKey() {
      const { publicKey, secretKey } = kem.keygen();
      // Store [secretKey | publicKey] as private key since we can't derive pubkey from secret
      const privateKey = concatBytes(secretKey, publicKey);
      return privateKey;
    },

    async getPublicKey(privateKeyBytes) {
      // Public key is appended after secret key
      return privateKeyBytes.slice(privateKeyBytes.length - publicKeySize);
    },

    async encrypt(content, publicKeyBytes) {
      const { cipherText, sharedSecret } = kem.encapsulate(publicKeyBytes);
      const key = sha256(sharedSecret);
      const nonce = sha256(cipherText).slice(0, 12);
      const encrypted = gcm(key, nonce).encrypt(content);
      return concatBytes(cipherText, encrypted);
    },

    async decrypt(data, privateKeyBytes) {
      if (data.length < cipherTextSize + 16) {
        throw new Error('Encrypted content too short');
      }
      const cipherText = data.slice(0, cipherTextSize);
      const encrypted = data.slice(cipherTextSize);
      // Extract secret key (everything before the appended public key)
      const secretKey = privateKeyBytes.slice(
        0,
        privateKeyBytes.length - publicKeySize,
      );
      const sharedSecret = kem.decapsulate(cipherText, secretKey);
      const key = sha256(sharedSecret);
      const nonce = sha256(cipherText).slice(0, 12);
      return gcm(key, nonce).decrypt(encrypted);
    },
  };
}

export const mlKem512 = createKEMHandler('ml-kem-512');
export const mlKem768 = createKEMHandler('ml-kem-768');
export const mlKem1024 = createKEMHandler('ml-kem-1024');
