import { use, useMemo, useRef, useSyncExternalStore } from 'react';
import { useAsyncFn } from 'react-use';
import type { RxDatabase, RxDocument, RxQuery } from 'rxdb';
import { db, getSyncState, subscribeSyncState, sync } from './internal';
import type { Collections } from './tables';

type DB = RxDatabase<Collections>;

const dbPromise = db();

export const useDb = (): DB => use(dbPromise);

export const useRxQuery = <T>(
  queryFactory: (db: DB) => RxQuery<T, T[]>,
): { data: RxDocument<T>[]; loading: boolean } => {
  const database = useDb();
  const query = useMemo(() => queryFactory(database), [database, queryFactory]);

  const initialRef = useRef(true);
  const store = useMemo(() => {
    initialRef.current = true;
    let current: RxDocument<T>[] = [];
    return {
      subscribe: (cb: () => void) => {
        const sub = query.$.subscribe((docs) => {
          current = docs as RxDocument<T>[];
          initialRef.current = false;
          cb();
        });
        return () => sub.unsubscribe();
      },
      getSnapshot: () => current,
    };
  }, [query]);

  const data = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return { data, loading: initialRef.current };
};

export const useSync = () => {
  const [state, trigger] = useAsyncFn(sync, []);
  const { lastSyncTime, hasLocalChanges } = useSyncExternalStore(
    subscribeSyncState,
    getSyncState,
  );

  return {
    sync: trigger,
    syncing: state.loading,
    error: state.error ?? null,
    lastSyncTime,
    hasLocalChanges,
  };
};
