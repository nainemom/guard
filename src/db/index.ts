import { base58 } from '@scure/base';
import { useMemo } from 'react';
import { create } from 'zustand';
import * as gdrive from './gdrive';

// --- Base types ---

export interface BaseEntity {
  id: string;
  updatedAt: number;
}

export interface Key extends BaseEntity {
  name: string;
  value: string;
  codec: string;
  method: string;
}

export type { UserProfile } from './gdrive';

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

// --- Table registry ---
// To add a new table: 1) define its interface above  2) add it to Tables  3) add it to emptyTables

interface Tables {
  keys: Key;
}

type TableName = keyof Tables;

const emptyTables = (): { [K in TableName]: Tables[K][] } => ({
  keys: [],
});

// --- Store ---

interface StoreState {
  tables: { [K in TableName]: Tables[K][] };
  connected: boolean;
  profile: gdrive.UserProfile | null;
  lastSyncTime: number | null;
}

const store = create<StoreState>(() => ({
  tables: emptyTables(),
  connected: gdrive.isConnected(),
  profile: gdrive.getUserProfile(),
  lastSyncTime: null,
}));

// --- GDrive I/O ---

type GDriveData = {
  tables: Partial<{ [K in TableName]: Tables[K][] }>;
};

let isSaving = false;
let saveQueued = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const scheduleSave = () => {
  if (isSaving) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 2000);
};

const syncConnectionState = () => {
  store.setState({
    connected: gdrive.isConnected(),
    profile: gdrive.getUserProfile(),
  });
};

const save = async () => {
  if (!gdrive.isConnected()) return;
  if (isSaving) {
    saveQueued = true;
    return;
  }

  isSaving = true;
  try {
    const { tables } = store.getState();
    await gdrive.write(JSON.stringify({ tables } satisfies GDriveData));
    store.setState({ lastSyncTime: Date.now() });
  } catch (e) {
    console.error('[db]', e);
    syncConnectionState();
  } finally {
    isSaving = false;
    if (saveQueued) {
      saveQueued = false;
      save();
    }
  }
};

const load = async () => {
  const raw = await gdrive.read();
  const data: GDriveData = raw ? JSON.parse(raw) : { tables: {} };

  const tables = emptyTables() as Record<TableName, BaseEntity[]>;
  for (const name of Object.keys(tables) as TableName[]) {
    const remote = data.tables[name];
    if (remote) {
      tables[name] = remote;
    }
  }

  // Migrate old keys
  for (const row of tables.keys) {
    const key = row as Key;
    if (!key.codec) key.codec = 'base64';
    const [method, keyType, keyData] = key.value.split(':');
    if (!key.method) key.method = method;
    key.id = buildKeyId({
      codec: key.codec,
      method: key.method,
      type: keyType,
      value: keyData,
    });
  }

  store.setState({
    tables: tables as StoreState['tables'],
    lastSyncTime: Date.now(),
  });
};

// --- Actions ---

export const db = {
  add: <K extends TableName>(
    table: K,
    item: Omit<Tables[K], 'updatedAt'>,
  ): Tables[K] => {
    const row = {
      ...item,
      updatedAt: Date.now(),
    } as Tables[K];

    store.setState((state) => {
      const existing = state.tables[table].some((r) => r.id === row.id);
      return {
        tables: {
          ...state.tables,
          [table]: existing
            ? state.tables[table].map((r) => (r.id === row.id ? row : r))
            : [...state.tables[table], row],
        },
      };
    });
    scheduleSave();
    return row;
  },

  update: <K extends TableName>(
    table: K,
    id: string,
    changes: Partial<Omit<Tables[K], 'id'>>,
  ): void => {
    store.setState((state) => ({
      tables: {
        ...state.tables,
        [table]: state.tables[table].map((row) =>
          row.id === id ? { ...row, ...changes, updatedAt: Date.now() } : row,
        ),
      },
    }));
    scheduleSave();
  },

  remove: (table: TableName, id: string): void => {
    store.setState((state) => ({
      tables: {
        ...state.tables,
        [table]: state.tables[table].filter((r) => r.id !== id),
      },
    }));
    scheduleSave();
  },

  connect: async (): Promise<void> => {
    await gdrive.connect();
    await load();
    store.setState({ connected: true, profile: gdrive.getUserProfile() });
  },

  disconnect: async (): Promise<void> => {
    gdrive.disconnect();
    store.setState({
      tables: emptyTables(),
      connected: false,
      profile: null,
      lastSyncTime: null,
    });
  },

  sync: save,
};

// --- Hooks ---

/**
 * Subscribe to all rows in a table. Re-renders when rows are added, removed, or updated.
 * Pass an optional `filter` to narrow the result — filtering is memoized so the
 * component only recomputes when the underlying table data changes.
 */
export function useTable<K extends TableName>(
  name: K,
  filter?: (row: Tables[K]) => boolean,
): Tables[K][] {
  const rows = store((state) => state.tables[name]);
  return useMemo(() => (filter ? rows.filter(filter) : rows), [rows, filter]);
}

/**
 * Subscribe to a single row by id. Only re-renders when that specific
 * row's fields change, not when other rows in the table change.
 */
export function useRow<K extends TableName>(
  name: K,
  id: string | undefined,
): Tables[K] | undefined {
  return store((state) =>
    id ? state.tables[name].find((r) => r.id === id) : undefined,
  );
}

export const useConnected = () => store((s) => s.connected);
export const useProfile = () => store((s) => s.profile);
export const useLastSyncTime = () => store((s) => s.lastSyncTime);

// --- Initialization ---

export const initDb = async (): Promise<void> => {
  if (gdrive.isConnected()) {
    try {
      await load();
    } catch {
      // Token expired or network error — start with empty data
      syncConnectionState();
    }
  }
};
