import type { Table } from 'dexie';
import { db } from '@/db';
import * as gdrive from './gdrive';

// --- Types ---

type SyncData = {
  tables: Record<string, unknown[]>;
  syncedAt: number;
};

// All tables must have 'id' and 'updatedAt' (enforced by BaseEntity in db module)
const ID_FIELD = 'id';
const TIMESTAMP_FIELD = 'updatedAt';

const LAST_SYNC_KEY = 'guard-last-sync';

// --- Public API ---

export const isConnected = gdrive.isConnected;
export const getUserProfile = gdrive.getUserProfile;
export type { UserProfile } from './gdrive';

export const getLastSyncTime = (): number | null => {
  const v = localStorage.getItem(LAST_SYNC_KEY);
  return v ? Number(v) : null;
};

export const connect = async () => {
  await gdrive.connect();
  await sync();
};

export const disconnect = () => {
  gdrive.disconnect();
};

// --- Sync internals ---

/** True while a sync is in progress. Used to prevent DB hooks from
 *  scheduling another sync while we're already writing merged data. */
let isSyncing = false;

/** If sync() is called while already syncing, we queue exactly one
 *  follow-up sync so the latest local changes still get pushed. */
let syncQueued = false;

/**
 * Merge a single table using last-sync-time diffing:
 *
 * - Both sides have the row  → keep the newer one (by timestamp)
 * - Only one side has it, and its timestamp > lastSync → new since last sync → keep
 * - Only one side has it, and its timestamp <= lastSync → other side deleted it → drop
 * - First sync (no lastSync) → keep everything
 */
const mergeTable = async (
  table: Table,
  remoteRows: unknown[],
  lastSync: number | null,
): Promise<unknown> => {
  const localRows = await table.toArray();

  const remoteById = new Map(remoteRows.map((r) => [r[ID_FIELD], r]));
  const localById = new Map(localRows.map((r) => [r[ID_FIELD], r]));
  const allIds = new Set([...remoteById.keys(), ...localById.keys()]);

  const merged: unknown[] = [];

  for (const id of allIds) {
    const remote = remoteById.get(id);
    const local = localById.get(id);

    if (remote && local) {
      // Both sides have this row — keep the newer one
      merged.push(
        remote[TIMESTAMP_FIELD] > local[TIMESTAMP_FIELD] ? remote : local,
      );
    } else {
      // Only one side has it
      // biome-ignore lint/style/noNonNullAssertion: one of remote or local is guaranteed to exist
      const row = (remote ?? local)!;

      if (!lastSync || row[TIMESTAMP_FIELD] > lastSync) {
        // First sync or created/updated after last sync → keep it
        merged.push(row);
      }
      // Otherwise: the other side deleted it since last sync → drop it
    }
  }

  await db.transaction('rw', table, async () => {
    await table.bulkPut(merged);
    // Remove local rows that were dropped (deleted on remote)
    const mergedIds = new Set(merged.map((r) => r[ID_FIELD]));
    const toDelete = localRows
      .filter((r) => !mergedIds.has(r[ID_FIELD]))
      .map((r) => r[ID_FIELD]);
    if (toDelete.length > 0) {
      await table.bulkDelete(toDelete);
    }
  });

  return merged;
};

export const sync = async (): Promise<void> => {
  if (!gdrive.isConnected()) return;

  // If already syncing, queue one follow-up instead of running in parallel
  if (isSyncing) {
    syncQueued = true;
    return;
  }

  isSyncing = true;
  try {
    const lastSync = getLastSyncTime();
    const raw = await gdrive.read();
    const remoteTables: Record<string, unknown[]> =
      (raw ? JSON.parse(raw) : {}).tables ?? {};

    const merged: SyncData = { tables: {}, syncedAt: Date.now() };

    for (const table of db.tables) {
      merged.tables[table.name] = await mergeTable(
        table,
        remoteTables[table.name] ?? [],
        lastSync,
      );
    }

    await gdrive.write(JSON.stringify(merged));
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
  } catch (e) {
    console.error('[sync]', e);
    throw e;
  } finally {
    isSyncing = false;

    // If a sync was requested while we were busy, run it now
    if (syncQueued) {
      syncQueued = false;
      sync();
    }
  }
};

// --- Auto-sync: debounced on DB changes ---

let syncTimer: ReturnType<typeof setTimeout> | undefined;

const debouncedSync = () => {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    if (gdrive.isConnected()) sync();
  }, 2000);
};

const scheduleSyncIfIdle = () => {
  if (!isSyncing) setTimeout(debouncedSync, 0);
};

export const initAutoSync = () => {
  for (const table of db.tables) {
    table.hook('creating', scheduleSyncIfIdle);
    table.hook('updating', () => {
      scheduleSyncIfIdle();
    });
    table.hook('deleting', scheduleSyncIfIdle);
  }

  if (gdrive.isConnected()) {
    sync();
  }
};
