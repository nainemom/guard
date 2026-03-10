import { beforeAll, describe, expect, it } from 'vitest';
import {
  decrypt,
  encrypt,
  generatePrivateKey,
  getPublicKey,
  METHODS,
} from './index';

// TODO: make sure to check if method removed from list
// TODO: make sure all methods can decrypt previously encrypted (from early versions) contents

const ALL_IDS = Object.keys(METHODS);

const TEST_CONTENTS = [
  { name: 'empty', data: new Uint8Array([]) },
  { name: '1 byte', data: new Uint8Array([42]) },
  { name: '16 bytes', data: new Uint8Array(16).map((_, i) => i) },
  { name: '256 bytes', data: new Uint8Array(256).map((_, i) => i % 256) },
  { name: '1 KiB', data: new Uint8Array(1024).fill(0xab) },
  { name: '64 KiB', data: new Uint8Array(65536).fill(0xcd) },
  {
    name: 'all byte values',
    data: new Uint8Array(256).map((_, i) => i),
  },
  {
    name: 'UTF-8 unicode',
    data: new TextEncoder().encode('Hello 世界 🌍 éèê АБВ'),
  },
];

describe.each(ALL_IDS)('method: %s', (methodId) => {
  let privateKey: string;
  let publicKey: string;

  beforeAll(async () => {
    privateKey = await generatePrivateKey(methodId);
    publicKey = await getPublicKey(privateKey);
  });

  describe.each(TEST_CONTENTS)('encrypt/decrypt with $name', ({ data }) => {
    it('round-trips correctly', async () => {
      const encrypted = await encrypt(data, publicKey);
      const decrypted = await decrypt(encrypted, privateKey);
      expect(decrypted).toEqual(data);
    });

    it('ciphertext is larger than plaintext', async () => {
      const encrypted = await encrypt(data, publicKey);
      expect(encrypted.length).toBeGreaterThan(data.length);
    });
  });

  it('produces non-deterministic ciphertexts', async () => {
    const content = new Uint8Array([1, 2, 3, 4]);
    const enc1 = await encrypt(content, publicKey);
    const enc2 = await encrypt(content, publicKey);
    expect(enc1).not.toEqual(enc2);
  });

  it('fails to decrypt with different key', async () => {
    const content = new Uint8Array([1, 2, 3, 4, 5]);
    const encrypted = await encrypt(content, publicKey);
    const otherPrivate = await generatePrivateKey(methodId);
    await expect(decrypt(encrypted, otherPrivate)).rejects.toThrow();
  });

  it('fails to decrypt tampered ciphertext', async () => {
    const content = new Uint8Array([10, 20, 30]);
    const encrypted = await encrypt(content, publicKey);
    const tampered = new Uint8Array(encrypted);
    tampered[tampered.length - 1] ^= 0xff;
    await expect(decrypt(tampered, privateKey)).rejects.toThrow();
  });
});
