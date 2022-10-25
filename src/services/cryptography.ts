import { ENCRYPTION_MODULES_LENGTH, ENCRYPTION_SHA_SIZE, ENCRYPTION_TYPE, LOCAL_HASH_ALGORITHM } from '@/constants';

export enum CryptographyShaHashSize {
  sha1 = 1,
  sha256 = 256,
  sha384 = 384,
  sha512 = 512,
}

export enum CryptographyModulesLength {
  '2kb' = 2048,
  '4kb' = 4096,
}

export type CryptographyPublicKey = string;
export type CryptographyPrivateKey = string;
export interface CryptographyPairKeys {
  public_key: CryptographyPublicKey,
  private_key: CryptographyPrivateKey,
}


export const ab2str = (buf: ArrayBuffer): string => {
  const bufView = new Uint8Array(buf);
  return [...Array(bufView.length)].map((_, index) => {
    return String.fromCharCode(bufView[index]);
  }).join('');
}

export const str2ab = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  [...Array(str.length)].forEach((_, index) => {
    bufView[index] = str.charCodeAt(index);
  });
  return buf;
}

export const str2hex = (str: string): string => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const hex = str.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
  }
  return result.toUpperCase();
}

export const getHashName = (hash: CryptographyShaHashSize): string => `SHA-${hash}`;

export const getMaximumMessageSize = (modulusLength: CryptographyModulesLength, hash: CryptographyShaHashSize) => modulusLength / 8 - 2 * hash / 8 - 2 ;

export const generatePairKeys = async () : Promise<CryptographyPairKeys> => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_TYPE,
      modulusLength: ENCRYPTION_MODULES_LENGTH,
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
    public_key: btoa(ab2str(publicBuffer)),
    private_key: btoa(ab2str(privateBuffer)),
  };
}

export const decrypt = async (message: string, privateKey: CryptographyPrivateKey): Promise<string> => {
  const keyObject = await crypto.subtle.importKey(
    'pkcs8',
    str2ab(atob(privateKey)),
    {
      name: ENCRYPTION_TYPE,
      hash: `SHA-${ENCRYPTION_SHA_SIZE}`,
    },
    false,
    ['decrypt']
  );
  return ab2str(
    await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_TYPE,
      },
      keyObject,
      str2ab(atob(message)),
    ),
  );
}

export const encrypt = async (message: string, publicKey: CryptographyPublicKey): Promise<string> => {
  const keyObject = await crypto.subtle.importKey(
    'spki',
    str2ab(atob(publicKey)),
    {
      name: ENCRYPTION_TYPE,
      hash: `SHA-${ENCRYPTION_SHA_SIZE}`,
    },
    false,
    ['encrypt']
  );
  return btoa(ab2str(
    await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_TYPE,
      },
      keyObject,
      str2ab(message),
    ),
  ));
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
    .then((hashed) => btoa(ab2str(hashed)))
    .catch((e) => {
      hashCache.delete(content);
      throw e;
    });
  hashCache.set(content, promise);
  return promise;
}

