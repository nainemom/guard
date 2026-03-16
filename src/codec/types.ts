export type MethodHandler<T> = {
  id: string;
  name: string;
  description: string;
  encode: (data: Uint8Array) => Promise<T>;
  decode: (data: T) => Promise<Uint8Array>;
};
