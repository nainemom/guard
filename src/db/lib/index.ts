import {
  addRxPlugin,
  createRxDatabase,
  type RxCollection,
  type RxDatabase,
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

export const createDatabase = async <T extends Record<string, RxCollection>>(
  name: string,
  collections: {
    [K in keyof T]: {
      schema: any;
      migrationStrategies?: Record<number, (doc: any) => any>;
    };
  },
): Promise<RxDatabase<T>> => {
  const db = await createRxDatabase<T>({
    name,
    storage: getRxStorageDexie(),
    cleanupPolicy: {
      minimumDeletedTime: 1000 * 60 * 60 * 24 * 30,
      runEach: 1000 * 60 * 5,
    },
  });

  await db.addCollections(collections as any);

  return db;
};
