import { gcm } from '@noble/ciphers/aes.js';
import { randomBytes } from '@noble/ciphers/utils.js';
import type { MethodHandler } from '../types';
import { concatBytes } from '../utils';

interface RSAConfig {
  name: string;
  description: string;
  modulusLength: number;
  rsaCiphertextSize: number;
}

const RSA_CONFIGS = {
  'rsa-2048': {
    name: 'RSA-2048',
    description: 'Hybrid RSA-2048 with AES-256-GCM. 112-bit security.',
    modulusLength: 2048,
    rsaCiphertextSize: 256,
  } satisfies RSAConfig,
  'rsa-4096': {
    name: 'RSA-4096',
    description: 'Hybrid RSA-4096 with AES-256-GCM. 140-bit security.',

    modulusLength: 4096,
    rsaCiphertextSize: 512,
  } satisfies RSAConfig,
};

function createRSAHandler(id: keyof typeof RSA_CONFIGS): MethodHandler {
  const { modulusLength, rsaCiphertextSize, name, description } =
    RSA_CONFIGS[id];

  return {
    id,
    type: 'asymmetric',
    category: 'rsa',
    name,
    description,

    async generatePrivateKey() {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt'],
      );
      const spki = new Uint8Array(
        await crypto.subtle.exportKey('spki', keyPair.publicKey),
      );
      const pkcs8 = new Uint8Array(
        await crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
      );
      // Store [2-byte BE SPKI length | SPKI | PKCS8] as private key blob
      const lenBuf = new Uint8Array(2);
      lenBuf[0] = (spki.length >> 8) & 0xff;
      lenBuf[1] = spki.length & 0xff;
      return concatBytes(lenBuf, spki, pkcs8);
    },

    async getPublicKey(privateKeyBytes) {
      const spkiLen = (privateKeyBytes[0] << 8) | privateKeyBytes[1];
      return privateKeyBytes.slice(2, 2 + spkiLen);
    },

    async encrypt(content, publicKeyBytes) {
      const publicKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBytes.buffer as ArrayBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt'],
      );
      // Hybrid: RSA-OAEP wraps a random AES-256-GCM key + nonce
      const aesKey = randomBytes(32);
      const nonce = randomBytes(12);
      const aesCiphertext = gcm(aesKey, nonce).encrypt(content);
      const wrappedKey = new Uint8Array(
        await crypto.subtle.encrypt(
          'RSA-OAEP',
          publicKey,
          concatBytes(aesKey, nonce).buffer as ArrayBuffer,
        ),
      );
      return concatBytes(wrappedKey, aesCiphertext);
    },

    async decrypt(data, privateKeyBytes) {
      if (data.length < rsaCiphertextSize + 16) {
        throw new Error('Encrypted content too short');
      }
      const spkiLen = (privateKeyBytes[0] << 8) | privateKeyBytes[1];
      const pkcs8 = privateKeyBytes.slice(2 + spkiLen);
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        pkcs8,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt'],
      );
      const wrappedKey = data.slice(0, rsaCiphertextSize);
      const aesCiphertext = data.slice(rsaCiphertextSize);
      const keyAndNonce = new Uint8Array(
        await crypto.subtle.decrypt('RSA-OAEP', privateKey, wrappedKey),
      );
      const aesKey = keyAndNonce.slice(0, 32);
      const nonce = keyAndNonce.slice(32, 44);
      return gcm(aesKey, nonce).decrypt(aesCiphertext);
    },
  };
}

export const rsa2048 = createRSAHandler('rsa-2048');
export const rsa4096 = createRSAHandler('rsa-4096');
