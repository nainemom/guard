export type CryptographyKey = string;

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

export interface CryptographyPairKeys {
  publicKey: CryptographyKey,
  privateKey: CryptographyKey,
}
