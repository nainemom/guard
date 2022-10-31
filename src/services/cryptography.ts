import { ENCRYPTION_SHA_SIZE, ENCRYPTION_TYPE, LOCAL_HASH_ALGORITHM } from '@/constants';
import { abs2ab, str2ab, uatob, ubtoa } from '@/utils/convert';

export type CryptographyPublicKey = string;

export type CryptographyPrivateKey = string;

export type CryptographyPairKeys = {
  public_key: CryptographyPublicKey,
  private_key: CryptographyPrivateKey,
}

export type CryptographyModulusLength = 2048 | 4096;

export type CryptographyProgressCallback = (current: number, total: number) => void;

const calculateEncryptedSliceSize = (modulusLength: number) => modulusLength / 8;

const calculateMessageSliceSize = (modulusLength: number) => modulusLength / 8 - 2 * ENCRYPTION_SHA_SIZE / 8 - 2;

export const generatePairKeys = async (modulusLength: CryptographyModulusLength = 4096) : Promise<CryptographyPairKeys> => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_TYPE,
      modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: `SHA-${ENCRYPTION_SHA_SIZE}`,
    },
    true,
    ['encrypt', 'decrypt'],
  );
  const [publicBuffer, privateBuffer] = await Promise.all([
    crypto.subtle.exportKey('spki', keyPair.publicKey),
    crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
  ]);
  return {
    public_key: ubtoa(publicBuffer),
    private_key: ubtoa(privateBuffer),
  };
}

export const decrypt = async (encrypted: ArrayBuffer, privateKey: CryptographyPrivateKey, onProgress?: CryptographyProgressCallback): Promise<ArrayBuffer> => {
  const progress = onProgress || (() => {});
  let current = 0;
  progress(current, encrypted.byteLength);
  const keyObject = await crypto.subtle.importKey(
    'pkcs8',
    uatob(privateKey),
    {
      name: ENCRYPTION_TYPE,
      hash: `SHA-${ENCRYPTION_SHA_SIZE}`,
    },
    false,
    ['decrypt']
  );

  let arrayBuffers: ArrayBuffer[] = [];
  const sliceSize = calculateEncryptedSliceSize((keyObject.algorithm as RsaKeyAlgorithm).modulusLength);
  do {
    const endByte = Math.min(current + sliceSize, encrypted.byteLength);
    arrayBuffers = [
      ...arrayBuffers,
      await crypto.subtle.decrypt(
        {
          name: ENCRYPTION_TYPE,
        },
        keyObject,
        encrypted.slice(current, endByte),
      ),
    ];
    current = endByte;
    progress(current, encrypted.byteLength);
  } while (current < encrypted.byteLength);

  return abs2ab(arrayBuffers);
}

export const encrypt = async (raw: ArrayBuffer, publicKey: CryptographyPublicKey, onProgress?: CryptographyProgressCallback): Promise<ArrayBuffer> => {
  const progress = onProgress || (() => {});
  let current = 0;
  progress(current, raw.byteLength);
  const keyObject = await crypto.subtle.importKey(
    'spki',
    uatob(publicKey),
    {
      name: ENCRYPTION_TYPE,
      hash: `SHA-${ENCRYPTION_SHA_SIZE}`,
    },
    false,
    ['encrypt']
  );

  let arrayBuffers: ArrayBuffer[] = [];
  const sliceSize = calculateMessageSliceSize((keyObject.algorithm as RsaKeyAlgorithm).modulusLength);
  do {
    const endByte = Math.min(current + sliceSize, raw.byteLength);
    arrayBuffers = [
      ...arrayBuffers,
      await crypto.subtle.encrypt(
        {
          name: ENCRYPTION_TYPE,
        },
        keyObject,
        raw.slice(current, endByte),
      ),
    ];
    current = endByte;
    progress(current, raw.byteLength);
  } while (current < raw.byteLength);

  return abs2ab(arrayBuffers);
}


const hashCache = new Map();
export const hash = (content: string) => {
  if (hashCache.has(content)) {
    const cached = hashCache.get(content);
    if (cached instanceof Promise) {
      return cached;
    }
    return Promise.resolve(cached);
  }
  const promise = crypto.subtle.digest(LOCAL_HASH_ALGORITHM, str2ab(content))
    .then((hashed) => ubtoa(hashed))
    .catch((e) => {
      hashCache.delete(content);
      throw e;
    });
  hashCache.set(content, promise);
  return promise;
}

