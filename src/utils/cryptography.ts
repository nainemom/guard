import { CryptographyKey, CryptographyPairKeys } from '@/types';

const ab2str = (buf: ArrayBuffer): string => {
  const bufView = new Uint8Array(buf);
  return [...Array(bufView.length)].map((_, index) => {
    return String.fromCharCode(bufView[index]);
  }).join('');
}

const str2ab = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  [...Array(str.length)].forEach((_, index) => {
    bufView[index] = str.charCodeAt(index);
  });
  return buf;
}

const algorithm: RsaHashedKeyGenParams = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

export const generatePairKeys = async () : Promise<CryptographyPairKeys> => {
  const keyPair = await crypto.subtle.generateKey(
    algorithm,
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
    algorithm,
    false,
    ['decrypt']
  );
  return ab2str(
    await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      keyObject,
      str2ab(atob(message)),
    ),
  );
}

export const encrypt = async (message: string, publicKey: CryptographyKey): Promise<string> => {
  if (message.length > 190) throw new Error('Maximum length of encrypting message is 190');
  const keyObject = await crypto.subtle.importKey(
    'spki',
    str2ab(atob(publicKey)),
    algorithm,
    false,
    ['encrypt']
  );
  return btoa(ab2str(
    await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      keyObject,
      str2ab(message),
    ),
  ));
}
