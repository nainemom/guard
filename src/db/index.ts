import Dexie, { type EntityTable } from 'dexie';

/** Every table must extend this to be syncable. */
export interface BaseEntity {
  id: string;
  updatedAt: number;
}

export interface Key extends BaseEntity {
  name: string;
  value: string;
}

export interface Message extends BaseEntity {
  keyId: string;
  operation: 'encrypt' | 'decrypt';
  codec: string;
  input: string;
  status: 'done' | 'error';
  outputType?: 'string' | 'file';
  output?: string;
  error?: string;
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
  keys: '&id, name, value, updatedAt',
  messages: '&id, keyId, updatedAt',
});

// Generic hooks for all tables: auto-fill BaseEntity fields
for (const table of db.tables) {
  table.hook('creating', (_primaryKey, obj) => {
    obj.id ??= crypto.randomUUID();
    obj.updatedAt ??= Date.now();
  });

  table.hook('updating', (modifications: Partial<BaseEntity>) => {
    if (modifications.updatedAt === undefined) {
      return { updatedAt: Date.now() };
    }
    return {};
  });
}

// Cascade delete messages when a key is deleted
db.keys.hook('deleting', (primaryKey) => {
  db.messages.where('keyId').equals(primaryKey).delete();
});

export const dbReady = db.open();

export { db };
