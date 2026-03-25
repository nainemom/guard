import { base64 } from './methods/base64';
import { randomImage } from './methods/images';
import { emoji, persianEveryday } from './methods/texts';

export type { MethodCategory, MethodHandler } from './types';

export const METHODS = {
  [base64.id]: base64,
  [emoji.id]: emoji,
  [persianEveryday.id]: persianEveryday,
  [randomImage.id]: randomImage,
};

export const encode = <M extends keyof typeof METHODS>(
  method: M,
  data: Uint8Array,
) => METHODS[method].encode(data);

export const decode = <M extends keyof typeof METHODS>(
  method: M,
  data: unknown,
) => METHODS[method].decode(data as never);
