import { base58 } from '@scure/base';
import type { METHODS as CODEC_METHODS } from '@/codec';
import type { METHODS as CRYPTO_METHODS, KeyType } from '@/crypto';
import { createDatabase, defineTable } from './lib';

export type ParsedKeyValue = {
  codec: keyof typeof CODEC_METHODS;
  method: keyof typeof CRYPTO_METHODS;
  type: KeyType;
  value: Uint8Array<ArrayBufferLike>;
};

export type KeyEntity = {
  value: string;
  name: string;
  updatedAt: number;
  isDeleted: boolean;
};

export const parseKeyValue = (input: KeyEntity['value']): ParsedKeyValue => {
  const [codec, method, type, value] = input.split('/');
  return {
    codec,
    method,
    type,
    value: base58.decode(value),
  } as ParsedKeyValue;
};
export const buildKeyValue = (input: ParsedKeyValue): KeyEntity['value'] =>
  `${input.codec}/${input.method}/${input.type}/${base58.encode(input.value)}`;

export const { db, load, save } = createDatabase('guardb', {
  keys: defineTable<KeyEntity>({
    config: [
      {
        schema: '&value, name, updatedAt, isDeleted',
      },
    ],
    merge: (local, remote) => {
      const map = new Map<string, (typeof local)[number]>();
      for (const row of local) {
        map.set(row.value, row);
      }
      for (const row of remote) {
        const existing = map.get(row.value);
        if (!existing || row.updatedAt > existing.updatedAt) {
          map.set(row.value, row);
        }
      }
      return [...map.values()].filter((row) => !row.isDeleted);
    },
  }),
});
