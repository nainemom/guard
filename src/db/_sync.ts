// import { db, setSkipTimestamps } from './index';
// import { auth, readFile, writeFile } from './gdrive';

// // ─── Sync state ──────────────────────────────────────────

// const SYNC_TIME_KEY = 'guard-last-sync-time';

// let lastSyncTime: number | null = (() => {
//   const v = localStorage.getItem(SYNC_TIME_KEY);
//   return v ? Number(v) : null;
// })();
// let hasLocalChanges = false;
// let isSyncing = false;
// let changeSubsSetUp = false;

// let syncStateSnapshot: {
//   lastSyncTime: number | null;
//   hasLocalChanges: boolean;
// } = { lastSyncTime, hasLocalChanges };
// const syncListeners = new Set<() => void>();

// const notifySyncListeners = () => {
//   syncStateSnapshot = { lastSyncTime, hasLocalChanges };
//   for (const cb of syncListeners) cb();
// };

// export const subscribeSyncState = (cb: () => void) => {
//   syncListeners.add(cb);
//   return () => {
//     syncListeners.delete(cb);
//   };
// };

// export const getSyncState = () => syncStateSnapshot;

// // Detect local changes on startup
// const detectLocalChanges = async () => {
//   if (!lastSyncTime) return;
//   const database = db();
//   for (const table of database.tables) {
//     const count = await table.where('updatedAt').above(lastSyncTime).count();
//     if (count > 0) {
//       hasLocalChanges = true;
//       notifySyncListeners();
//       return;
//     }
//   }
// };

// detectLocalChanges();

// // ─── Sync ────────────────────────────────────────────────

// type Doc = Record<string, unknown>;

// export const sync = async () => {
//   const database = db();

//   // Set up change tracking once
//   if (!changeSubsSetUp) {
//     changeSubsSetUp = true;
//     for (const table of database.tables) {
//       const markChanged = () => {
//         if (!isSyncing && !hasLocalChanges) {
//           hasLocalChanges = true;
//           notifySyncListeners();
//         }
//       };
//       table.hook('creating', markChanged);
//       table.hook('updating', markChanged);
//       table.hook('deleting', markChanged);
//     }
//   }

//   isSyncing = true;

//   try {
//     // 1. Auth
//     const token = await auth();

//     for (const table of database.tables) {
//       const filename = `guard-sync-${table.name}.json`;
//       const primaryKey = table.schema.primKey.name;

//       // 2. Download remote
//       const { data: raw, fileId, etag } = await readFile(token, filename);
//       const remoteDocs: Doc[] = raw ? JSON.parse(raw) : [];

//       // 3. Merge remote into local (LWW by updatedAt)
//       setSkipTimestamps(true);
//       try {
//         for (const remoteDoc of remoteDocs) {
//           const key = remoteDoc[primaryKey] as string;
//           const localDoc = (await table.get(key)) as Doc | undefined;

//           if (!localDoc) {
//             await table.add(remoteDoc);
//           } else if (
//             (remoteDoc.updatedAt as number) > (localDoc.updatedAt as number)
//           ) {
//             const { [primaryKey]: _, ...updates } = remoteDoc;
//             await table.update(key, updates);
//           }
//         }
//       } finally {
//         setSkipTimestamps(false);
//       }

//       // 4. Push merged local to remote
//       const allDocs = await table.toArray();
//       await writeFile(token, JSON.stringify(allDocs), filename, fileId, etag);
//     }

//     lastSyncTime = Date.now();
//     localStorage.setItem(SYNC_TIME_KEY, String(lastSyncTime));
//     hasLocalChanges = false;
//   } finally {
//     isSyncing = false;
//     notifySyncListeners();
//   }
// };
