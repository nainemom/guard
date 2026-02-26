import { base64urlnopad } from '@scure/base';
import type { MethodHandler } from '../../types';

export const base64: MethodHandler<string> = {
  id: 'base-64',
  name: 'Base64',
  description: 'Encode text using Base64 url method',
  output: 'string',
  encode: async (data) => base64urlnopad.encode(data),
  decode: async (data) => base64urlnopad.decode(data),
};
