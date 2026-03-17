export type MethodCategory = 'image' | 'text';

export type MethodHandler<T> = {
  id: string;
  name: string;
  description: string;
  category: MethodCategory;
  encode: (data: Uint8Array) => Promise<T>;
  decode: (data: T) => Promise<Uint8Array>;
};
