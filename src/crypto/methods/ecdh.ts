import { gcm } from '@noble/ciphers/aes.js';
import { x448 } from '@noble/curves/ed448.js';
import { x25519 } from '@noble/curves/ed25519.js';
import { p256, p384, p521 } from '@noble/curves/nist.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import type { MethodHandler } from '../types';
import { concatBytes } from '../utils';

interface MontgomeryCurve {
  getSharedSecret(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array;
  getPublicKey(privateKey: Uint8Array): Uint8Array;
  utils: { randomSecretKey(): Uint8Array };
  GuBytes: Uint8Array;
}

interface WeierstrassCurve {
  getSharedSecret(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array;
  getPublicKey(privateKey: Uint8Array, isCompressed?: boolean): Uint8Array;
  utils: { randomSecretKey(): Uint8Array };
}

type ECDHConfig = { name: string; description: string } & (
  | { type: 'montgomery'; curve: MontgomeryCurve; pubKeySize: number }
  | {
      type: 'weierstrass';
      curve: WeierstrassCurve;
      compressedPubKeySize: number;
    }
);

const ECDH_CONFIGS: Record<string, ECDHConfig> = {
  'ecdh-x25519': {
    type: 'montgomery',
    curve: x25519,
    pubKeySize: 32,
    name: 'ECDH X25519',
    description:
      'Designed by Daniel J. Bernstein, 2006. Montgomery curve + AES-256-GCM. RFC 7748. 128-bit security.',
  },
  'ecdh-x448': {
    type: 'montgomery',
    curve: x448,
    pubKeySize: 56,
    name: 'ECDH X448',
    description:
      'Designed by Mike Hamburg, 2015. Montgomery curve + AES-256-GCM. RFC 7748. 224-bit security.',
  },
  'ecdh-p256': {
    type: 'weierstrass',
    curve: p256,
    compressedPubKeySize: 33,
    name: 'ECDH P-256',
    description:
      'Standardized by NIST, 2000. Short Weierstrass curve + AES-256-GCM. FIPS 186-4. 128-bit security.',
  },
  'ecdh-p384': {
    type: 'weierstrass',
    curve: p384,
    compressedPubKeySize: 49,
    name: 'ECDH P-384',
    description:
      'Standardized by NIST, 2000. Short Weierstrass curve + AES-256-GCM. FIPS 186-4. 192-bit security.',
  },
  'ecdh-p521': {
    type: 'weierstrass',
    curve: p521,
    compressedPubKeySize: 67,
    name: 'ECDH P-521',
    description:
      'Standardized by NIST, 2000. Short Weierstrass + AES-256-GCM, Mersenne prime 2^521-1. FIPS 186-4. 256-bit security.',
  },
  'ecdh-secp256k1': {
    type: 'weierstrass',
    curve: secp256k1,
    compressedPubKeySize: 33,
    name: 'ECDH Secp256k1',
    description:
      'Defined by Certicom, 2000. Short Weierstrass / Koblitz + AES-256-GCM. 128-bit security. Used in Bitcoin/Ethereum.',
  },
};

function createECDHHandler(id: keyof typeof ECDH_CONFIGS): MethodHandler {
  const config = ECDH_CONFIGS[id];

  function randomPrivateKey(): Uint8Array {
    return config.curve.utils.randomSecretKey();
  }

  function getPublicKeyBytes(privateKey: Uint8Array): Uint8Array {
    if (config.type === 'montgomery') {
      return config.curve.getPublicKey(privateKey);
    }
    return config.curve.getPublicKey(privateKey, true);
  }

  function getSharedSecret(
    privateKey: Uint8Array,
    publicKey: Uint8Array,
  ): Uint8Array {
    const raw = config.curve.getSharedSecret(privateKey, publicKey);
    // Weierstrass returns compressed point (prefix + x-coordinate);
    // strip the prefix to use only the x-coordinate per NIST SP 800-56A.
    // Montgomery (x25519/x448) already returns the raw shared secret.
    if (config.type === 'weierstrass') {
      return raw.slice(1);
    }
    return raw;
  }

  function ephPubKeySize(): number {
    return config.type === 'montgomery'
      ? config.pubKeySize
      : config.compressedPubKeySize;
  }

  return {
    id,
    type: 'asymmetric',
    category: 'ecdh',

    name: config.name,
    description: config.description,

    async generatePrivateKey() {
      return randomPrivateKey();
    },

    async getPublicKey(privateKeyBytes) {
      return getPublicKeyBytes(privateKeyBytes);
    },

    async encrypt(content, publicKeyBytes) {
      const ephPrivate = randomPrivateKey();
      const ephPublic = getPublicKeyBytes(ephPrivate);
      const shared = getSharedSecret(ephPrivate, publicKeyBytes);
      const key = sha256(shared);
      const nonce = sha256(ephPublic).slice(0, 12);
      const ciphertext = gcm(key, nonce).encrypt(content);
      return concatBytes(ephPublic, ciphertext);
    },

    async decrypt(data, privateKeyBytes) {
      const size = ephPubKeySize();
      if (data.length < size + 16) {
        throw new Error('Encrypted content too short');
      }
      const ephPublic = data.slice(0, size);
      const ciphertext = data.slice(size);
      const shared = getSharedSecret(privateKeyBytes, ephPublic);
      const key = sha256(shared);
      const nonce = sha256(ephPublic).slice(0, 12);
      return gcm(key, nonce).decrypt(ciphertext);
    },
  };
}

export const ecdhX25519 = createECDHHandler('ecdh-x25519');
export const ecdhX448 = createECDHHandler('ecdh-x448');
export const ecdhP256 = createECDHHandler('ecdh-p256');
export const ecdhP384 = createECDHHandler('ecdh-p384');
export const ecdhP521 = createECDHHandler('ecdh-p521');
export const ecdhSecp256k1 = createECDHHandler('ecdh-secp256k1');
