import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encode, METHODS } from '../index';

const dir = dirname(fileURLToPath(import.meta.url));

const generateBytes = (len: number) => {
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = (i * 137 + 43) % 256;
  return arr;
};

const sizes = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];

for (const method of Object.keys(METHODS) as (keyof typeof METHODS)[]) {
  const file = resolve(dir, `${method}.json`);
  if (existsSync(file)) {
    console.log(`skipped ${file} (already exists)`);
    continue;
  }
  const vectors: Record<string, { original: string; encoded: string }> = {};
  for (const size of sizes) {
    const original = generateBytes(size);
    vectors[`${size}`] = {
      original: new TextDecoder().decode(original),
      encoded: String(await encode(original, method)),
    };
  }
  writeFileSync(file, `${JSON.stringify(vectors, null, 2)}\n`);
  console.log(`wrote ${file}`);
}
