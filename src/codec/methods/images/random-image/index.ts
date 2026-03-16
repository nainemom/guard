import { rings, shapes, thumbs } from '@dicebear/collection';
import { toPng } from '@dicebear/converter';
import { createAvatar } from '@dicebear/core';
import type { ImageCollection } from '../lib';

const collections = [rings, shapes, thumbs];

const lightBackgrounds = [
  'f5f5f5',
  'fce4ec',
  'e3f2fd',
  'e8f5e9',
  'fff3e0',
  'f3e5f5',
  'fff8e1',
  'e0f7fa',
  'fbe9e7',
  'ede7f6',
  'e8eaf6',
  'f1f8e9',
  'fff9c4',
  'ffe0b2',
];

export const randomImageCollection: ImageCollection = {
  generateBaseImage: async () => {
    const collection =
      collections[Math.floor(Math.random() * collections.length)];
    const bg =
      lightBackgrounds[Math.floor(Math.random() * lightBackgrounds.length)];
    const svg = createAvatar(collection as never, {
      backgroundColor: [bg],
      backgroundType: ['solid'],
      randomizeIds: true,
      seed: Math.random().toString(),
      size: 256,
    }).toString();
    const dataUri = await toPng(svg).toDataUri();
    const base64 = dataUri.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return createImageBitmap(new Blob([bytes], { type: 'image/png' }));
  },
};
