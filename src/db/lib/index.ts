import {
  addRxPlugin,
  createRxDatabase,
  type RxCollection,
  type RxDatabase,
  type RxJsonSchema,
  toTypedRxJsonSchema,
} from 'rxdb';
import { RxDBCleanupPlugin } from 'rxdb/plugins/cleanup';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBJsonDumpPlugin);
addRxPlugin(RxDBCleanupPlugin);

export { toTypedRxJsonSchema };
export type { RxCollection };

export interface CollectionConfig {
  schema: RxJsonSchema<Record<string, unknown>>;
  migrationStrategies?: Record<
    number,
    (doc: Record<string, unknown>) => Record<string, unknown>
  >;
}

let skipTimestamps = false;
export const setSkipTimestamps = (v: boolean) => {
  skipTimestamps = v;
};

export const createDatabase = async <T extends Record<string, RxCollection>>(
  name: string,
  collections: { [K in keyof T]: CollectionConfig },
): Promise<RxDatabase<T>> => {
  const db = await createRxDatabase<T>({
    name,
    storage: getRxStorageDexie(),
    cleanupPolicy: {
      minimumDeletedTime: 1000 * 60 * 60 * 24 * 30,
      runEach: 1000 * 60 * 5,
    },
  });

  // biome-ignore lint/suspicious/noExplicitAny: RxDB's addCollections type requires exact internal types that can't be satisfied externally
  await db.addCollections(collections as Record<string, any>);

  for (const collection of Object.values(db.collections) as RxCollection[]) {
    collection.preInsert((data: Record<string, unknown>) => {
      data.updatedAt ??= Date.now();
    }, false);
    collection.preSave((data: Record<string, unknown>) => {
      if (!skipTimestamps) data.updatedAt = Date.now();
    }, false);
  }

  return db;
};
