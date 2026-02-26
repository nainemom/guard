import Dexie, { type EntityTable } from 'dexie';
import type { KeyType } from '@/crypto';

export interface Key {
  id: string;
  name: string;
  value: string;
  type: KeyType;
  createdAt: string;
  updatedAt: string;
}

const db = new Dexie('guard', {
  autoOpen: true,
}) as Dexie & {
  keys: EntityTable<Key, 'id'>;
};

db.version(1).stores({
  keys: '&id, name, type, createdAt, updatedAt',
});

// Auto-generate id, createdAt, updatedAt on insert
db.keys.hook('creating', (_primaryKey, obj) => {
  const now = new Date().toISOString();
  obj.id = crypto.randomUUID();
  obj.createdAt = now;
  obj.updatedAt = now;
});

// Auto-update updatedAt on save
db.keys.hook('updating', () => {
  return { updatedAt: new Date().toISOString() };
});

export { db };
