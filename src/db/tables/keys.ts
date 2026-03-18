import { base58 } from '@scure/base';
import type { ExtractDocumentTypeFromTypedRxJsonSchema } from 'rxdb';
import { toTypedRxJsonSchema } from '../lib';

export const schema = toTypedRxJsonSchema({
  version: 0,
  primaryKey: 'value',
  type: 'object',
  properties: {
    value: { type: 'string', maxLength: 512 },
    codec: { type: 'string' },
    name: { type: 'string' },
    updatedAt: { type: 'number' },
  },
  required: ['value', 'codec', 'name', 'updatedAt'],
} as const);

export type Key = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schema>;

// URL encoding for sharing keys

export interface KeyParams {
  codec: string;
  method: string;
  type: string;
  value: string;
}

export const encodeKeyParams = (params: KeyParams): string =>
  base58.encode(new TextEncoder().encode(JSON.stringify(params)));

export const decodeKeyParams = (encoded: string): KeyParams | null => {
  try {
    return JSON.parse(new TextDecoder().decode(base58.decode(encoded)));
  } catch {
    return null;
  }
};

export const buildKeyValue = (params: KeyParams): string =>
  `${params.method}:${params.type}:${params.value}`;
