import Dexie, { type EntityTable } from 'dexie';

export interface Conversation {
  id: string;
  token: string;
  channel: 'gmail';
  friendId: string;
  myPrivateKey: string;
  myPublicKey: string;
  friendPublicKey?: string;
  status: 'pending' | 'ready';
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  direction: 'sent' | 'received';
  text: string;
  externalId?: string;
  createdAt: number;
}

const db = new Dexie('guard', {
  autoOpen: true,
}) as Dexie & {
  conversations: EntityTable<
    Conversation,
    'id',
    Pick<
      Conversation,
      'channel' | 'friendId' | 'myPrivateKey' | 'myPublicKey' | 'token'
    >
  >;
  directMessages: EntityTable<
    DirectMessage,
    'id',
    Pick<DirectMessage, 'conversationId' | 'direction' | 'text'>
  >;
};

// Legacy schema versions (for migration from previous app versions)
db.version(1).stores({
  keys: '&id, name, value, createdAt, updatedAt',
});

db.version(2).stores({
  keys: '&id, name, value, createdAt, updatedAt',
  messages: '&id, keyId, createdAt',
});

db.version(3).stores({
  keys: '&id, name, value, createdAt, updatedAt',
  messages: '&id, keyId, createdAt',
  contacts: '&id, email, myKeyId, createdAt, updatedAt',
  chatMessages: '&id, contactId, externalId, createdAt',
});

// Current schema — removes legacy tables, adds conversations
db.version(4).stores({
  keys: null,
  messages: null,
  contacts: null,
  chatMessages: null,
  conversations: '&id, token, channel, friendId, status, createdAt, updatedAt',
  directMessages: '&id, conversationId, externalId, createdAt',
});

db.conversations.hook('creating', (_primaryKey, obj) => {
  const now = Date.now();
  obj.id ??= crypto.randomUUID();
  obj.token ??= crypto.randomUUID();
  obj.createdAt ??= now;
  obj.updatedAt ??= now;
});

db.conversations.hook('updating', (modifications) => {
  if (modifications.updatedAt === undefined) {
    return { updatedAt: Date.now() };
  }
  return {};
});

db.conversations.hook('deleting', (primaryKey) => {
  db.directMessages.where('conversationId').equals(primaryKey).delete();
});

db.directMessages.hook('creating', (_primaryKey, obj) => {
  obj.id ??= crypto.randomUUID();
  obj.createdAt ??= Date.now();
});

export const dbReady = db.open();

export { db };
