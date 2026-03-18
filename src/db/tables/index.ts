import type { CollectionConfig, RxCollection } from '../lib';
import * as keys from './keys';

export type Collections = {
  keys: RxCollection<keys.Key>;
};

export const definitions: {
  [K in keyof Collections]: CollectionConfig;
} = {
  keys: { schema: keys.schema },
};
