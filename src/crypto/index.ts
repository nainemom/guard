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
import type { MethodHandler } from './types';

export const METHODS: Record<string, MethodHandler> = {
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

export const generatePrivateKey = (methodId: string) =>
  METHODS[methodId].generatePrivateKey();

export const getPublicKey = (
  methodId: string,
  privateKey: Uint8Array<ArrayBufferLike>,
) => METHODS[methodId].getPublicKey(privateKey);

export const encrypt = (
  methodId: string,
  content: Uint8Array,
  publicKey: Uint8Array<ArrayBufferLike>,
) => METHODS[methodId].encrypt(content, publicKey);

export const decrypt = (
  methodId: string,
  content: Uint8Array,
  privateKey: Uint8Array<ArrayBufferLike>,
) => METHODS[methodId].decrypt(content, privateKey);

export * from './types';
