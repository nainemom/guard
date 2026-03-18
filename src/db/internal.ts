import type { RxReplicationState } from 'rxdb/plugins/replication';
import { createDatabase, type RxCollection } from './lib';
import { replicateGDrive } from './lib/gdrive';
import { type Collections, definitions } from './tables';

// ─── Database ────────────────────────────────────────────

let dbPromise: ReturnType<typeof createDatabase<Collections>> | null = null;

export const db = () => {
  dbPromise ??= createDatabase<Collections>('guard', definitions);
  return dbPromise;
};

// ─── Sync ────────────────────────────────────────────────

let replications: RxReplicationState<any, any>[] = [];
let lastSyncTime: number | null = null;
let hasLocalChanges = false;
let isSyncing = false;
let changeSubsSetUp = false;

let syncStateSnapshot: {
  lastSyncTime: number | null;
  hasLocalChanges: boolean;
} = { lastSyncTime, hasLocalChanges };
const syncListeners = new Set<() => void>();

const notifySyncListeners = () => {
  syncStateSnapshot = { lastSyncTime, hasLocalChanges };
  for (const cb of syncListeners) cb();
};

export const subscribeSyncState = (cb: () => void) => {
  syncListeners.add(cb);
  return () => {
    syncListeners.delete(cb);
  };
};

export const getSyncState = () => syncStateSnapshot;

export const sync = async () => {
  const database = await db();

  // Set up change tracking once
  if (!changeSubsSetUp) {
    changeSubsSetUp = true;
    for (const collection of Object.values(database.collections)) {
      (collection as RxCollection).$.subscribe(() => {
        if (!isSyncing && !hasLocalChanges) {
          hasLocalChanges = true;
          notifySyncListeners();
        }
      });
    }
  }

  // Cancel previous replications to clear persisted checkpoints
  for (const rep of replications) {
    await rep.cancel();
  }

  isSyncing = true;

  replications = Object.values(database.collections).map((collection) =>
    replicateGDrive(collection as RxCollection),
  );

  for (const rep of replications) {
    rep.start();
  }

  await Promise.all(replications.map((rep) => rep.awaitInitialReplication()));

  isSyncing = false;
  lastSyncTime = Date.now();
  hasLocalChanges = false;
  notifySyncListeners();
};
