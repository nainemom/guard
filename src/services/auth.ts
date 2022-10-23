import { CryptographyPairKeys } from "@/services/cryptography";
import { get, set } from "@/services/storage";

export const storageKey = 'auth';

export const getAuth = (): CryptographyPairKeys | null => get(storageKey);

export const saveAuth = (newAuth: CryptographyPairKeys) => {
  if (!newAuth.private_key || !newAuth.public_key) {
    throw new Error('Auth Error!');
  }
  set(storageKey, newAuth);
  return newAuth;
}

export const clearAuth = () => {
  set(storageKey, null);
  return null;
}