import { createDatabase, type RxCollection, setSkipTimestamps } from './lib';
import { auth, readFile, writeFile } from './lib/gdrive';
import { type Collections, definitions } from './tables';

// ─── Database ────────────────────────────────────────────

let dbPromise: ReturnType<typeof createDatabase<Collections>> | null = null;

export const db = () => {
  dbPromise ??= createDatabase<Collections>('guard', definitions);
  return dbPromise;
};

// ─── Sync state ──────────────────────────────────────────

const SYNC_TIME_KEY = 'guard-last-sync-time';

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

// Detect local changes on startup
const detectLocalChanges = async () => {
  if (!lastSyncTime) return;
  const database = await db();
  for (const collection of Object.values(database.collections)) {
    const docs = await (collection as RxCollection).find().exec();
    if (lastSyncTime && docs.some((d) => d._data._meta.lwt > lastSyncTime)) {
      hasLocalChanges = true;
      notifySyncListeners();
      return;
    }
  }
};

detectLocalChanges();

// ─── Sync ────────────────────────────────────────────────

type Doc = Record<string, unknown>;

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

  try {
    // 1. Auth
    const token = await auth();

    for (const collection of Object.values(database.collections)) {
      const coll = collection as RxCollection;
      const filename = `guard-sync-${coll.name}.json`;
      const primaryPath = coll.schema.primaryPath;

      // 2. Download remote
      const { data: raw, fileId, etag } = await readFile(token, filename);
      const remoteDocs: Doc[] = raw ? JSON.parse(raw) : [];

      // 3. Merge remote into local (LWW by updatedAt)
      setSkipTimestamps(true);
      try {
        for (const remoteDoc of remoteDocs) {
          const key = remoteDoc[primaryPath] as string;
          const localDoc = await coll.findOne(key).exec();

          if (!localDoc) {
            await coll.insert(remoteDoc);
          } else if (
            (remoteDoc.updatedAt as number) > (localDoc.updatedAt as number)
          ) {
            const { [primaryPath]: _, ...updates } = remoteDoc;
            await localDoc.patch(updates);
          }
        }
      } finally {
        setSkipTimestamps(false);
      }

      // 4. Push merged local to remote
      const allDocs = await coll.find().exec();
      const exportData = allDocs.map((d) => d.toJSON());
      await writeFile(
        token,
        JSON.stringify(exportData),
        filename,
        fileId,
        etag,
      );
    }

    lastSyncTime = Date.now();
    localStorage.setItem(SYNC_TIME_KEY, String(lastSyncTime));
    hasLocalChanges = false;
  } finally {
    isSyncing = false;
    notifySyncListeners();
  }
};
