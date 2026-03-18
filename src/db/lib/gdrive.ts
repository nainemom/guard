/// <reference path="./gis.d.ts" />

import type { RxCollection } from 'rxdb';
import {
  type RxReplicationState,
  replicateRxCollection,
} from 'rxdb/plugins/replication';

// ─── Google Drive API ────────────────────────────────────

const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

let gisPromise: Promise<void> | null = null;

const loadGIS = (): Promise<void> => {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
  return gisPromise;
};

let cachedToken: string | null = null;
let tokenExpiry = 0;

export const auth = async (): Promise<string> => {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  await loadGIS();
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        cachedToken = response.access_token;
        tokenExpiry = Date.now() + response.expires_in * 1000 - 60_000;
        resolve(cachedToken);
      },
      error_callback: (error) => {
        reject(new Error(error.message));
      },
    });
    client.requestAccessToken();
  });
};

const apiFetch = async (
  token: string,
  url: string,
  init?: RequestInit,
): Promise<Response> => {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (res.status === 401) {
    cachedToken = null;
    tokenExpiry = 0;
  }
  return res;
};

const readFile = async (
  token: string,
  filename: string,
): Promise<{
  data: string | null;
  fileId: string | null;
  etag: string | null;
}> => {
  const res = await apiFetch(
    token,
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${filename}'&fields=files(id)`,
  );
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  const list: { files: { id: string }[] } = await res.json();

  if (list.files.length === 0) return { data: null, fileId: null, etag: null };

  const fileId = list.files[0].id;
  const dataRes = await apiFetch(
    token,
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
  );
  if (dataRes.status === 404) return { data: null, fileId: null, etag: null };
  if (!dataRes.ok) throw new Error(`Drive API error: ${dataRes.status}`);

  return {
    data: await dataRes.text(),
    fileId,
    etag: dataRes.headers.get('etag'),
  };
};

const writeFile = async (
  token: string,
  content: string,
  filename: string,
  fileId: string | null,
  etag: string | null,
): Promise<void> => {
  if (fileId) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (etag) headers['If-Match'] = etag;

    const res = await apiFetch(
      token,
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      { method: 'PATCH', headers, body: content },
    );
    if (res.status === 412)
      throw new Error('Conflict: remote file changed during sync');
    if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  } else {
    const metadata = { name: filename, parents: ['appDataFolder'] };
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
    );
    form.append('file', new Blob([content], { type: 'application/json' }));
    const res = await apiFetch(
      token,
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      { method: 'POST', body: form },
    );
    if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  }
};

// ─── RxDB Replication ────────────────────────────────────

export const replicateGDrive = (
  collection: RxCollection,
  replicationIdentifier = `gdrive-${collection.name}`,
): RxReplicationState<unknown, unknown> => {
  const filename = `guard-sync-${collection.name}.json`;
  const primaryPath = collection.schema.primaryPath;

  type Doc = Record<string, unknown>;

  return replicateRxCollection({
    collection,
    replicationIdentifier,
    live: false,
    autoStart: false,
    retryTime: 30_000,

    pull: {
      async handler(checkpoint) {
        if (checkpoint) return { documents: [], checkpoint };

        const token = await auth();
        const result = await readFile(token, filename);

        const docs: Doc[] = result.data ? JSON.parse(result.data) : [];
        return {
          documents: docs,
          checkpoint: docs.length ? Date.now() : undefined,
        };
      },
    },

    push: {
      async handler(changeRows) {
        const token = await auth();
        const result = await readFile(token, filename);

        const remote = new Map(
          (result.data ? (JSON.parse(result.data) as Doc[]) : []).map((d) => [
            d[primaryPath],
            d,
          ]),
        );
        for (const { newDocumentState } of changeRows) {
          remote.set(newDocumentState[primaryPath], newDocumentState);
        }

        await writeFile(
          token,
          JSON.stringify([...remote.values()]),
          filename,
          result.fileId,
          result.etag,
        );
        return [];
      },
    },
  });
};
