import { emojiCollection } from './emoji';
import { createSteganographyHandler } from './lib';
import { persianEverydayCollection } from './persian-everyday';

export const emoji = createSteganographyHandler(emojiCollection, {
  id: 'emoji',
  name: 'Emoji',
  description: 'Encode text using emojies',
  output: 'string',
});

export const persianEveryday = createSteganographyHandler(
  persianEverydayCollection,
  {
    id: 'persian-everyday',
    name: 'Persian Everyday',
    description: 'Encode text using persian sentences',
    output: 'string',
  },
);
