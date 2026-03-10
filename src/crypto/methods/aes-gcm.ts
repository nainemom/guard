import { gcm } from '@noble/ciphers/aes.js';
import { concatBytes, randomBytes } from '@noble/ciphers/utils.js';
import type { MethodHandler } from '../types';

const KEY_SIZE = 32;
const NONCE_SIZE = 12;

export const aes256Gcm: MethodHandler = {
  id: 'aes-256-gcm',
  name: 'AES-256-GCM',
  description: 'Standard symmetric authenticated encryption. 256-bit security.',
  type: 'symmetric',
  category: 'standard',

  async generatePrivateKey() {
    return randomBytes(KEY_SIZE);
  },

  async getPublicKey(privateKeyBytes) {
    return privateKeyBytes;
  },

  async encrypt(content, publicKeyBytes) {
    const nonce = randomBytes(NONCE_SIZE);
    const ciphertext = gcm(publicKeyBytes, nonce).encrypt(content);
    return concatBytes(nonce, ciphertext);
  },

  async decrypt(data, privateKeyBytes) {
    if (data.length < NONCE_SIZE + 16) {
      throw new Error('Encrypted content too short');
    }
    const nonce = data.slice(0, NONCE_SIZE);
    const ciphertext = data.slice(NONCE_SIZE);
    return gcm(privateKeyBytes, nonce).decrypt(ciphertext);
  },
};
