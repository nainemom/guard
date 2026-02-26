export type MethodHandler<T> = {
  id: string;
  name: string;
  description: string;
  output: 'string' | 'file';
  encode: (data: Uint8Array) => Promise<T>;
  decode: (data: T) => Promise<Uint8Array>;
};
