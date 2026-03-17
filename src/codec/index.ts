import { base64 } from './methods/base64';
import { randomImage } from './methods/images';
import { emoji, persianEveryday } from './methods/texts';

export type { MethodCategory, MethodHandler } from './types';

export const METHODS = {
  base64,
  emoji,
  persianEveryday,
  randomImage,
};

export const encode = <M extends keyof typeof METHODS>(
  data: Uint8Array,
  method: M,
) => METHODS[method].encode(data);

export const decode = <M extends keyof typeof METHODS>(
  data: unknown,
  method: M,
) => METHODS[method].decode(data as never);
