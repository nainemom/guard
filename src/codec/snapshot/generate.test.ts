import { it } from 'vitest';
import { commands } from 'vitest/browser';
import { encode, METHODS } from '../index';

declare module 'vitest/browser' {
  interface BrowserCommands {
    snapshotExists: (method: string) => Promise<boolean>;
    writeSnapshot: (method: string, content: string) => Promise<void>;
  }
}

const generateBytes = (len: number) => {
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = (i * 137 + 43) % 256;
  return arr;
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

const sizes = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];

it('generates codec snapshots', async () => {
  for (const method of Object.keys(METHODS) as (keyof typeof METHODS)[]) {
    const exists = await commands.snapshotExists(method);
    if (exists) {
      console.log(`skipped ${method} (already exists)`);
      continue;
    }

    const vectors: Record<string, { original: string; encoded: string }> = {};
    for (const size of sizes) {
      const original = generateBytes(size);
      const encoded = await encode(method, original);
      vectors[`${size}`] = {
        original: new TextDecoder().decode(original),
        encoded:
          encoded instanceof File
            ? await fileToDataUrl(encoded)
            : String(encoded),
      };
    }

    await commands.writeSnapshot(method, JSON.stringify(vectors, null, 2));
    console.log(`wrote ${method}`);
  }
}, 120_000);
