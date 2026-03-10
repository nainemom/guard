import { describe, expect, it } from 'vitest';
import { decode, encode, METHODS } from './index';

type Snapshots = Record<string, { original: string; encoded: string }>;

const generateBytes = (len: number) => {
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = (i * 137 + 43) % 256;
  return arr;
};

const vectorFiles = import.meta.glob<Snapshots>('./snapshot/*.json', {
  eager: true,
  import: 'default',
});

for (const method of Object.keys(METHODS) as (keyof typeof METHODS)[]) {
  describe(method, () => {
    const snapshots = vectorFiles[`./snapshot/${method}.json`];

    it('has snapshot file', () => {
      expect(snapshots).toBeDefined();
      expect(Object.keys(snapshots).length).toBeGreaterThan(0);
    });

    if (!snapshots) return;

    for (const [size, { encoded }] of Object.entries(snapshots)) {
      const bytes = generateBytes(Number(size));

      it(`decodes ${size} bytes from snapshot`, async () => {
        expect(await decode(encoded, method)).toEqual(bytes);
      });

      it(`encodes then decodes ${size} bytes`, async () => {
        const enc = await encode(bytes, method);
        expect(await decode(enc, method)).toEqual(bytes);
      });
    }
  });
}
