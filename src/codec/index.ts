import { base64 } from './methods/base64';
import { emoji, persianEveryday } from './methods/texts';

export type { MethodHandler } from './types';

export const METHODS = {
  persianEveryday,
  emoji,
  base64,
};

export const encode = <M extends keyof typeof METHODS>(
  data: Uint8Array,
  method: M,
) => METHODS[method].encode(data);

export const decode = <M extends keyof typeof METHODS>(
  data: unknown,
  method: M,
) => METHODS[method].decode(data as never);
