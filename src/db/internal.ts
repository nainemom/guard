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

const SYNC_TIME_KEY = 'guard-last-sync-time';

let replications: RxReplicationState<any, any>[] = [];
let lastSyncTime: number | null = (() => {
  const v = localStorage.getItem(SYNC_TIME_KEY);
  return v ? Number(v) : null;
})();
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

// Check if any doc was written after lastSyncTime
const detectLocalChanges = async () => {
  if (!lastSyncTime) return;
  const database = await db();
  for (const collection of Object.values(database.collections)) {
    const docs = await (collection as RxCollection).find().exec();
    for (const doc of docs) {
      if (doc._data._meta.lwt > lastSyncTime) {
        hasLocalChanges = true;
        notifySyncListeners();
        return;
      }
    }
  }
};

// Run on module load — detect changes that happened before this session
detectLocalChanges();

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

  isSyncing = true;

  // Unique identifier per sync cycle — avoids stale checkpoints from previous runs
  const syncId = String(Date.now());
  replications = Object.values(database.collections).map((collection) =>
    replicateGDrive(
      collection as RxCollection,
      `gdrive-${collection.name}-${syncId}`,
    ),
  );

  for (const rep of replications) {
    rep.start();
  }

  await Promise.all(replications.map((rep) => rep.awaitInitialReplication()));

  isSyncing = false;
  lastSyncTime = Date.now();
  localStorage.setItem(SYNC_TIME_KEY, String(lastSyncTime));
  hasLocalChanges = false;
  notifySyncListeners();
};
