import { ENCRYPTION_MODULES_LENGTH, ENCRYPTION_SHA_SIZE, ENCRYPTION_TYPE } from '@/constants';
import { CryptographyKey, CryptographyModulesLength, CryptographyPairKeys, CryptographyShaHashSize } from '@/types';

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
  const publicKey = btoa(ab2str(publicBuffer));
  const privateKey = btoa(ab2str(privateBuffer));
  return {
    publicKey,
    privateKey,
  };
}

export const decrypt = async (message: string, privateKey: CryptographyKey): Promise<string> => {
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

export const encrypt = async (message: string, publicKey: CryptographyKey): Promise<string> => {
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
