import Dexie, { type EntityTable } from 'dexie';

export interface Key {
  id: string;
  name: string;
  value: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  keyId: string;
  operation: 'encrypt' | 'decrypt';
  codec: string;
  input: string;
  status: 'done' | 'error';
  outputType?: 'string' | 'file';
  output?: string;
  error?: string;
  createdAt: number;
}

const db = new Dexie('guard', {
  autoOpen: true,
}) as Dexie & {
  keys: EntityTable<Key, 'id', Pick<Key, 'name' | 'value'>>;
  messages: EntityTable<
    Message,
    'id',
    Pick<Message, 'keyId' | 'operation' | 'codec' | 'input'>
  >;
};

db.version(1).stores({
  keys: '&id, name, value, createdAt, updatedAt',
});

db.version(2).stores({
  keys: '&id, name, value, createdAt, updatedAt',
  messages: '&id, keyId, createdAt',
});

// Auto-generate id, createdAt, updatedAt on insert (skip if already set, e.g. from sync)
db.keys.hook('creating', (_primaryKey, obj) => {
  const now = Date.now();
  obj.id ??= crypto.randomUUID();
  obj.createdAt ??= now;
  obj.updatedAt ??= now;
});

// Auto-update updatedAt on save (skip if update already includes updatedAt, e.g. from sync)
db.keys.hook('updating', (modifications) => {
  if (modifications.updatedAt === undefined) {
    return { updatedAt: Date.now() };
  }
  return {};
});

// Cascade delete messages when a key is deleted
db.keys.hook('deleting', (primaryKey) => {
  db.messages.where('keyId').equals(primaryKey).delete();
});

// Auto-generate id, createdAt on insert (skip if already set, e.g. from sync)
db.messages.hook('creating', (_primaryKey, obj) => {
  obj.id ??= crypto.randomUUID();
  obj.createdAt ??= Date.now();
});

export const dbReady = db.open();

export { db };
