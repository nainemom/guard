import Dexie, { type EntityTable } from 'dexie';

export interface Key {
  id: string;
  name: string;
  value: string;
  createdAt: number;
  updatedAt: number;
}

const db = new Dexie('guard', {
  autoOpen: true,
}) as Dexie & {
  keys: EntityTable<Key, 'id', Pick<Key, 'name' | 'value'>>;
};

db.version(1).stores({
  keys: '&id, name, value, createdAt, updatedAt',
});

// Auto-generate id, createdAt, updatedAt on insert
db.keys.hook('creating', (_primaryKey, obj) => {
  const now = Date.now();
  obj.id = crypto.randomUUID();
  obj.createdAt = now;
  obj.updatedAt = now;
});

// Auto-update updatedAt on save
db.keys.hook('updating', () => {
  return { updatedAt: Date.now() };
});

export const dbReady = db.open();

export { db };
