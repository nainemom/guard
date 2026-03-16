import { createImageHandler } from './lib';
import { randomImageCollection } from './random-image';

export const randomImage = createImageHandler(randomImageCollection, {
  id: 'random-image',
  name: 'Random Image',
  description: 'Encode data using random avatar images',
});
