/// <reference path="./gis.d.ts" />

const SCOPES =
  'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly openid profile email';
const FILENAME = 'guard-sync.json';
const TOKEN_KEY = 'guard-gdrive-token';
const FILE_ID_KEY = 'guard-gdrive-file-id';
const PROFILE_KEY = 'guard-gdrive-profile';

export interface UserProfile {
  name: string;
  picture: string;
  email: string;
}

const getToken = () => localStorage.getItem(TOKEN_KEY);

export const isConnected = () => !!getToken();

export const getUserProfile = (): UserProfile | null => {
  const v = localStorage.getItem(PROFILE_KEY);
  return v ? JSON.parse(v) : null;
};

export const disconnect = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(FILE_ID_KEY);
  localStorage.removeItem(PROFILE_KEY);
};

const loadGIS = (): Promise<void> =>
  new Promise((resolve, reject) => {
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

const fetchUserProfile = async (): Promise<void> => {
  try {
    const res = await apiFetch('https://www.googleapis.com/oauth2/v3/userinfo');
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          name: data.name,
          picture: data.picture,
          email: data.email,
        }),
      );
    }
  } catch {
    // Best-effort
  }
};

export const connect = async (): Promise<void> => {
  await loadGIS();
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        localStorage.setItem(TOKEN_KEY, response.access_token);
        await fetchUserProfile();
        resolve();
      },
      error_callback: (error) => {
        reject(new Error(error.message));
      },
    });
    client.requestAccessToken();
  });
};

export const apiFetch = async (
  url: string,
  init?: RequestInit,
): Promise<Response> => {
  const token = getToken();
  if (!token) throw new Error('Not connected');
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (res.status === 401) {
    disconnect();
    throw new Error('Session expired');
  }
  return res;
};

const findFile = async (): Promise<string | null> => {
  const stored = localStorage.getItem(FILE_ID_KEY);
  if (stored) return stored;

  const res = await apiFetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILENAME}'&fields=files(id)`,
  );
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  const data: { files: { id: string }[] } = await res.json();
  if (data.files.length > 0) {
    localStorage.setItem(FILE_ID_KEY, data.files[0].id);
    return data.files[0].id;
  }
  return null;
};

export const read = async (): Promise<string | null> => {
  const fileId = await findFile();
  if (!fileId) return null;

  const res = await apiFetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
  );
  if (res.status === 404) {
    localStorage.removeItem(FILE_ID_KEY);
    return null;
  }
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  return res.text();
};

export const write = async (content: string): Promise<void> => {
  const fileId = await findFile();

  if (fileId) {
    const res = await apiFetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: content,
      },
    );
    if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  } else {
    const metadata = { name: FILENAME, parents: ['appDataFolder'] };
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
    );
    form.append('file', new Blob([content], { type: 'application/json' }));
    const res = await apiFetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      { method: 'POST', body: form },
    );
    if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
    const data: { id: string } = await res.json();
    localStorage.setItem(FILE_ID_KEY, data.id);
  }
};
