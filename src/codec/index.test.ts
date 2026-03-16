import { describe, expect, it } from 'vitest';
import { decode, encode, METHODS } from './index';

type Snapshots = Record<string, { original: string; encoded: string }>;

const generateBytes = (len: number) => {
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = (i * 137 + 43) % 256;
  return arr;
};

const dataUrlToFile = (dataUrl: string): File => {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], 'snapshot.png', { type: mime });
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
        const input = encoded.startsWith('data:')
          ? dataUrlToFile(encoded)
          : encoded;
        expect(await decode(input, method)).toEqual(bytes);
      });

      it(`encodes then decodes ${size} bytes`, async () => {
        const enc = await encode(bytes, method);
        expect(await decode(enc, method)).toEqual(bytes);
      });
    }
  });
}
