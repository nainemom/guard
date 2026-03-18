import type { RxCollection } from '../lib';
import * as keys from './keys';

export type Collections = {
  keys: RxCollection<keys.Key>;
};

export const definitions: {
  [K in keyof Collections]: {
    schema: any;
    migrationStrategies?: Record<number, (doc: any) => any>;
  };
} = {
  keys: { schema: keys.schema },
};
