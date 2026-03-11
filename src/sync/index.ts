import type { EntityTable } from 'dexie';
import { db } from '@/db';
import * as gdrive from './gdrive';

interface SyncTable {
  table: EntityTable<any, any>;
  idField: string;
  updatedAtField: string;
}

// Add tables to sync here:
const syncTables: SyncTable[] = [
  { table: db.conversations, idField: 'id', updatedAtField: 'updatedAt' },
  { table: db.directMessages, idField: 'id', updatedAtField: 'createdAt' },
];

type SyncData = {
  tables: Record<string, any[]>;
  syncedAt: number;
};

const LAST_SYNC_KEY = 'guard-last-sync';

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

const mergeTable = async (
  { table, idField, updatedAtField }: SyncTable,
  remoteRows: any[],
): Promise<any[]> => {
  const local = await table.toArray();
  const remoteMap = new Map(remoteRows.map((r) => [r[idField], r]));
  const localMap = new Map(local.map((r) => [r[idField], r]));
  const allIds = new Set([...remoteMap.keys(), ...localMap.keys()]);
  const merged: any[] = [];

  for (const id of allIds) {
    const r = remoteMap.get(id);
    const l = localMap.get(id);

    if (r && l) {
      const rTime = new Date(r[updatedAtField]).getTime();
      const lTime = new Date(l[updatedAtField]).getTime();
      merged.push(rTime > lTime ? r : l);
    } else {
      // biome-ignore lint/style/noNonNullAssertion: one of r or l is guaranteed to exist here
      merged.push((r ?? l)!);
    }
  }

  await db.transaction('rw', table, async () => {
    await table.bulkPut(merged);

    const mergedIds = new Set(merged.map((r) => r[idField]));
    const toDelete = local.filter((r) => !mergedIds.has(r[idField]));
    if (toDelete.length > 0) {
      await table.bulkDelete(toDelete.map((r) => r[idField]));
    }
  });

  return merged;
};

export const sync = async (): Promise<void> => {
  if (!gdrive.isConnected() || _syncing) return;
  _syncing = true;

  try {
    const raw = await gdrive.read();
    const parsed = raw ? JSON.parse(raw) : {};

    const remoteTables: Record<string, any[]> = parsed.tables ?? {};
    for (const { table } of syncTables) {
      if (!remoteTables[table.name] && Array.isArray(parsed[table.name])) {
        remoteTables[table.name] = parsed[table.name];
      }
    }

    const merged: SyncData = { tables: {}, syncedAt: Date.now() };

    for (const syncTable of syncTables) {
      const name = syncTable.table.name;
      merged.tables[name] = await mergeTable(
        syncTable,
        remoteTables[name] ?? [],
      );
    }

    await gdrive.write(JSON.stringify(merged));
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
  } catch (e) {
    console.error('[sync]', e);
    throw e;
  } finally {
    _syncing = false;
  }
};

// Auto-sync: debounced on DB changes, suppressed during sync
let syncTimer: ReturnType<typeof setTimeout> | undefined;
let _syncing = false;

const debouncedSync = () => {
  if (_syncing) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    if (gdrive.isConnected()) sync();
  }, 2000);
};

export const initAutoSync = () => {
  for (const { table } of syncTables) {
    table.hook('creating', () => {
      setTimeout(debouncedSync, 0);
    });
    table.hook('updating', () => {
      setTimeout(debouncedSync, 0);
      return {};
    });
    table.hook('deleting', () => {
      setTimeout(debouncedSync, 0);
    });
  }

  if (gdrive.isConnected()) {
    sync();
  }
};
