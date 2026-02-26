export type KeyType = 'public' | 'private';

export type MethodCategory = 'standard' | 'ecdh' | 'rsa' | 'post-quantum';

export interface MethodHandler {
  id: string;
  name: string;
  description: string;
  type: 'asymmetric' | 'symmetric';
  category: MethodCategory;
  generatePrivateKey(): Promise<Uint8Array>;
  getPublicKey(privateKeyBytes: Uint8Array): Promise<Uint8Array>;
  encrypt(content: Uint8Array, publicKeyBytes: Uint8Array): Promise<Uint8Array>;
  decrypt(data: Uint8Array, privateKeyBytes: Uint8Array): Promise<Uint8Array>;
}
