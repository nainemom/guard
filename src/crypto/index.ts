import { base58 } from '@scure/base';
import { aes256Gcm } from './methods/aes-gcm';
import {
  ecdhP256,
  ecdhP384,
  ecdhP521,
  ecdhSecp256k1,
  ecdhX448,
  ecdhX25519,
} from './methods/ecdh';
import { mlKem512, mlKem768, mlKem1024 } from './methods/ml-kem';
import { rsa2048, rsa4096 } from './methods/rsa';
import { salsa20 } from './methods/salsa20';
import { xchacha20 } from './methods/xchacha20';
import type { KeyType, MethodHandler } from './types';

export const METHODS = {
  [aes256Gcm.id]: aes256Gcm,
  [ecdhX25519.id]: ecdhX25519,
  [ecdhX448.id]: ecdhX448,
  [ecdhP256.id]: ecdhP256,
  [ecdhP384.id]: ecdhP384,
  [ecdhP521.id]: ecdhP521,
  [ecdhSecp256k1.id]: ecdhSecp256k1,
  [rsa2048.id]: rsa2048,
  [rsa4096.id]: rsa4096,
  [mlKem512.id]: mlKem512,
  [mlKem768.id]: mlKem768,
  [mlKem1024.id]: mlKem1024,
  [xchacha20.id]: xchacha20,
  [salsa20.id]: salsa20,
};

export function parseKey(key: string): {
  method: MethodHandler;
  type: KeyType;
  data: Uint8Array;
} {
  const [methodId, keyType, encodedData] = key.split(':');
  if (!methodId || !keyType || !key) throw new Error('Invalid key format');
  if (!['public', 'private'].includes(keyType))
    throw new Error(`Unknown key type: ${methodId}`);
  const method = METHODS[methodId];
  if (!method) throw new Error(`Unknown method: ${methodId}`);
  const data = base58.decode(encodedData);
  return { method, type: keyType as KeyType, data };
}

function formatKey(
  method: MethodHandler,
  keyType: KeyType,
  data: Uint8Array,
): string {
  return `${method.id}:${keyType}:${base58.encode(data)}`;
}

export async function generatePrivateKey(methodId: string) {
  const method = METHODS[methodId];
  if (!method) throw new Error(`Unknown method: ${methodId}`);
  const privateKey = await method.generatePrivateKey();
  return formatKey(method, 'private', privateKey);
}

export async function getPublicKey(privateKey: string): Promise<string> {
  const { method, data } = parseKey(privateKey);
  const pubBytes = await method.getPublicKey(data);
  return formatKey(method, 'public', pubBytes);
}

export async function encrypt(content: Uint8Array, publicKey: string) {
  const { method, data } = parseKey(publicKey);
  const encrypted = await method.encrypt(content, data);
  return encrypted;
}

export async function decrypt(
  encryptedContent: Uint8Array,
  privateKey: string,
): Promise<Uint8Array> {
  const { method, data: keyData } = parseKey(privateKey);
  return method.decrypt(encryptedContent, keyData);
}

export * from './types';
