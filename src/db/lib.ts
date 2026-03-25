import {
  Dexie,
  type Dexie as DexieDb,
  type Table as DexieTable,
  type EntityTable,
} from 'dexie';

type MigrationFn = (table: DexieTable) => PromiseLike<unknown>;

type MergeFn<S> = (local: S[], remote: S[]) => S[];

export type Snapshot = {
  timestamp: number;
  data: Record<string, unknown[]>;
};

export type TableConfig<S> = {
  config: ({ schema: string; migration?: MigrationFn } | null)[];
  merge: MergeFn<S>;
};

export const defineTable = <T>(tableConfig: TableConfig<T>) => tableConfig;

export const createDatabase = <T extends string, S extends object>(
  name: string,
  tables: Record<T, TableConfig<S>>,
) => {
  const tar = Object.entries(tables).map(([name, tc]) => ({
    name,
    ...(tc as TableConfig<S>),
  }));
  const db = new Dexie(name) as DexieDb & Record<T, EntityTable<S>>;
  let s: Record<string, string> = {};
  const mv = Math.max(...tar.map((t) => t.config.length));
  for (let v = 0; v < mv; v++) {
    const vc = tar
      .filter((t) => !!t.config[v])
      .map((t) => ({
        name: t.name,
        schema: t.config[v]?.schema as string,
        migration: t.config[v]?.migration,
      }));
    if (!vc.length) break;
    s = { ...s, ...Object.fromEntries(vc.map((t) => [t.name, t.schema])) };
    const dbv = db.version(v + 1).stores({ ...s });
    const migs = vc.map((t) => [t.name, t.migration] as const);
    if (migs.length)
      dbv.upgrade((tx) =>
        Promise.all(
          migs.map(async ([tn, fn]) => {
            await fn?.(tx.table(tn));
            return v;
          }),
        ),
      );
  }

  const save = async (): Promise<Snapshot> => {
    const snapshot: Snapshot = {
      timestamp: Date.now(),
      data: {},
    };
    for (const t of tar) {
      const tn = t.name;
      const td = await db.table(tn).toArray();
      snapshot.data[tn] = td;
    }
    return snapshot;
  };

  const load = async (snapshot: Snapshot, replace?: boolean): Promise<void> => {
    for (const t of tar) {
      const tn = t.name;
      const dt = db.table(tn);
      const dtd = await dt.toArray();
      const sd = snapshot.data[tn] ?? [];
      const wd = replace ? sd : t.merge(dtd, sd);
      dt.clear();
      await dt.bulkAdd(wd);
    }
  };

  return {
    db,
    save,
    load,
  };
};
