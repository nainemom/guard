import { randomBytes } from '@noble/ciphers/utils.js';
import type { MethodHandler } from '../types';

const KEY_SIZE = 32;

function xorBytes(data: Uint8Array, key: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }
  return result;
}

export const xor: MethodHandler = {
  id: 'xor',
  name: 'XOR',
  description:
    'Repeating-key XOR. NOT real encryption. Educational interest only.',
  type: 'symmetric',
  category: 'experimental',

  async generatePrivateKey() {
    return randomBytes(KEY_SIZE);
  },

  async getPublicKey(privateKeyBytes) {
    return privateKeyBytes;
  },

  async encrypt(content, publicKeyBytes) {
    return xorBytes(content, publicKeyBytes);
  },

  async decrypt(data, privateKeyBytes) {
    return xorBytes(data, privateKeyBytes);
  },
};
