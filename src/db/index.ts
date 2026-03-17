import { base58 } from '@scure/base';
import Dexie, { type EntityTable } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { create } from 'zustand';
import * as gdrive from './gdrive';

// --- Types ---

export interface Key {
  id: string;
  name: string;
  value: string;
  codec: string;
  method: string;
  updatedAt: number;
  syncedAt: number | null;
}

export interface KeyParams {
  codec: string;
  method: string;
  type: string;
  value: string;
}

export const encodeKeyParams = (params: KeyParams): string =>
  base58.encode(new TextEncoder().encode(JSON.stringify(params)));

export const decodeKeyParams = (encoded: string): KeyParams | null => {
  try {
    return JSON.parse(new TextDecoder().decode(base58.decode(encoded)));
  } catch {
    return null;
  }
};

export const buildKeyId = (params: KeyParams): string =>
  encodeKeyParams(params);

// --- Dexie Database ---

const localDb = new Dexie('guard') as Dexie & {
  keys: EntityTable<Key, 'id'>;
  meta: EntityTable<{ key: string; value: string | number | null }, 'key'>;
};

localDb.version(1).stores({
  keys: 'id',
  meta: 'key',
});

// --- GDrive state (zustand, non-persistent) ---

interface SyncState {
  connected: boolean;
  syncing: boolean;
}

const syncStore = create<SyncState>(() => ({
  connected: gdrive.isConnected(),
  syncing: false,
}));

const refreshConnectionState = () => {
  syncStore.setState({ connected: gdrive.isConnected() });
};

// --- Migration helper for remote data ---

const migrateKey = (raw: unknown): Key => {
  const key = raw as Key;
  if (!key.codec) key.codec = 'base64';
  const [method, keyType, keyData] = key.value.split(':');
  if (!key.method) key.method = method;
  key.id = buildKeyId({
    codec: key.codec,
    method: key.method,
    type: keyType,
    value: keyData,
  });
  key.syncedAt = key.syncedAt ?? null;
  return key;
};

// --- GDrive sync ---

type GDriveData = {
  keys: Key[];
};

const pull = async () => {
  const raw = await gdrive.read();
  if (!raw) return;
  const data: GDriveData = JSON.parse(raw);
  const remoteKeys = (data.keys ?? []).map(migrateKey);

  const now = Date.now();
  await localDb.transaction('rw', localDb.keys, async () => {
    for (const remote of remoteKeys) {
      const local = await localDb.keys.get(remote.id);
      if (!local || remote.updatedAt >= local.updatedAt) {
        await localDb.keys.put({ ...remote, syncedAt: now });
      }
    }
  });

  await localDb.meta.put({ key: 'lastSyncTime', value: now });
};

const push = async () => {
  const keys = await localDb.keys.toArray();
  await gdrive.write(JSON.stringify({ keys } satisfies GDriveData));

  const now = Date.now();
  await localDb.transaction('rw', localDb.keys, async () => {
    for (const key of keys) {
      await localDb.keys.update(key.id, { syncedAt: now });
    }
  });

  await localDb.meta.put({ key: 'lastSyncTime', value: now });
};

// --- Actions ---

export const db = {
  add: async (item: Omit<Key, 'updatedAt' | 'syncedAt'>): Promise<Key> => {
    const row: Key = { ...item, updatedAt: Date.now(), syncedAt: null };
    await localDb.keys.put(row);
    return row;
  },

  update: async (
    id: string,
    changes: Partial<Omit<Key, 'id'>>,
  ): Promise<void> => {
    await localDb.keys.update(id, {
      ...changes,
      updatedAt: Date.now(),
      syncedAt: null,
    });
  },

  remove: async (id: string): Promise<void> => {
    await localDb.keys.delete(id);
  },

  connect: async (): Promise<void> => {
    await gdrive.connect();
    syncStore.setState({ connected: true });
    await pull();
  },

  disconnect: (): void => {
    gdrive.disconnect();
    syncStore.setState({ connected: false });
  },

  pull: async (): Promise<void> => {
    syncStore.setState({ syncing: true });
    try {
      await pull();
    } finally {
      syncStore.setState({ syncing: false });
      refreshConnectionState();
    }
  },

  push: async (): Promise<void> => {
    syncStore.setState({ syncing: true });
    try {
      await push();
    } finally {
      syncStore.setState({ syncing: false });
      refreshConnectionState();
    }
  },

  sync: async (): Promise<void> => {
    syncStore.setState({ syncing: true });
    try {
      await pull();
      await push();
    } finally {
      syncStore.setState({ syncing: false });
      refreshConnectionState();
    }
  },
};

// --- Hooks ---

export function useKeys(): Key[] {
  return useLiveQuery(() => localDb.keys.toArray(), []) ?? [];
}

export function useKey(id: string | undefined): Key | undefined {
  return useLiveQuery(() => (id ? localDb.keys.get(id) : undefined), [id]);
}

export function useLastSyncTime(): number | null {
  const meta = useLiveQuery(() => localDb.meta.get('lastSyncTime'), []);
  return (meta?.value as number) ?? null;
}

export function useDirtyCount(): number {
  return (
    useLiveQuery(
      () =>
        localDb.keys
          .filter((k) => k.syncedAt === null || k.updatedAt > k.syncedAt)
          .count(),
      [],
    ) ?? 0
  );
}

export const useConnected = () => syncStore((s) => s.connected);
export const useSyncing = () => syncStore((s) => s.syncing);

// --- Initialization ---

export const initDb = async (): Promise<void> => {
  if (gdrive.isConnected()) {
    try {
      await pull();
    } catch {
      refreshConnectionState();
    }
  }
};
