import { xsalsa20poly1305 } from '@noble/ciphers/salsa.js';
import { randomBytes } from '@noble/ciphers/utils.js';
import type { MethodHandler } from '../types';
import { concatBytes } from '../utils';

const KEY_SIZE = 32;
const NONCE_SIZE = 24;

export const salsa20: MethodHandler = {
  id: 'xsalsa-20',
  name: 'XSalsa20-Poly1305',
  description:
    'Symmetric authenticated encryption (NaCl secretbox). 256-bit security.',
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
    const ciphertext = xsalsa20poly1305(publicKeyBytes, nonce).encrypt(content);
    return concatBytes(nonce, ciphertext);
  },

  async decrypt(data, privateKeyBytes) {
    if (data.length < NONCE_SIZE + 16) {
      throw new Error('Encrypted content too short');
    }
    const nonce = data.slice(0, NONCE_SIZE);
    const ciphertext = data.slice(NONCE_SIZE);
    return xsalsa20poly1305(privateKeyBytes, nonce).decrypt(ciphertext);
  },
};
