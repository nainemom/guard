import { apiFetch, getUserProfile } from '@/sync/gdrive';

const GUARD_EXCHANGE_PREFIX = 'guard://exchange/v1/';
const GUARD_MSG_PREFIX = 'guard://v1/';
const GUARD_INVITE_SUBJECT = 'Guard Invitation';
const GUARD_SUBJECT = 'Guard';

const utf8ToBase64url = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const base64urlToUtf8 = (str: string): string => {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
};

const createRawEmail = (to: string, subject: string, body: string): string => {
  const profile = getUserProfile();
  const fromHeader = profile?.email ? `From: ${profile.email}\r\n` : '';
  const message = `${fromHeader}To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`;
  return utf8ToBase64url(message);
};

// biome-ignore lint/suspicious/noExplicitAny: Gmail API response types are complex
const extractTextBody = (message: any): string | null => {
  const payload = message.payload;
  if (!payload) return null;

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return base64urlToUtf8(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return base64urlToUtf8(part.body.data);
      }
    }
  }

  return null;
};

const gmailSend = async (
  to: string,
  subject: string,
  body: string,
): Promise<string> => {
  const raw = createRawEmail(to, subject, body);
  const res = await apiFetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    },
  );
  if (!res.ok) throw new Error(`Gmail send failed: ${res.status}`);
  const data: { id: string } = await res.json();
  return data.id;
};

export const sendInvite = async (
  to: string,
  inviteUrl: string,
): Promise<string> => {
  const body = `You've been invited to a secure conversation on Guard.\n\nOpen this link to accept:\n${inviteUrl}`;
  return gmailSend(to, GUARD_INVITE_SUBJECT, body);
};

export const sendKeyExchange = async (
  to: string,
  token: string,
  publicKey: string,
): Promise<string> => {
  const body = `${GUARD_EXCHANGE_PREFIX}${token}/${publicKey}`;
  return gmailSend(to, GUARD_SUBJECT, body);
};

export const sendMessage = async (
  to: string,
  token: string,
  payload: string,
): Promise<string> => {
  const body = `${GUARD_MSG_PREFIX}${token}/${payload}`;
  return gmailSend(to, GUARD_SUBJECT, body);
};

export type ReceivedItem =
  | {
      type: 'exchange';
      id: string;
      token: string;
      publicKey: string;
      timestamp: number;
    }
  | {
      type: 'message';
      id: string;
      token: string;
      content: string;
      timestamp: number;
    };

export const receiveAll = async (
  fromEmail: string,
  knownIds: Set<string>,
): Promise<ReceivedItem[]> => {
  const query = `from:${fromEmail} subject:${GUARD_SUBJECT}`;
  const res = await apiFetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
  );

  if (!res.ok) throw new Error(`Gmail list failed: ${res.status}`);
  const data: { messages?: { id: string }[] } = await res.json();

  if (!data.messages?.length) return [];

  const results: ReceivedItem[] = [];

  for (const msg of data.messages) {
    if (knownIds.has(msg.id)) continue;

    const detail = await apiFetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
    );
    if (!detail.ok) continue;

    // biome-ignore lint/suspicious/noExplicitAny: Gmail API response
    const msgData: any = await detail.json();
    const body = extractTextBody(msgData);
    if (!body) continue;

    const ts = Number(msgData.internalDate);

    if (body.includes(GUARD_EXCHANGE_PREFIX)) {
      const idx = body.indexOf(GUARD_EXCHANGE_PREFIX);
      const rest = body.slice(idx + GUARD_EXCHANGE_PREFIX.length).trim();
      const slashIdx = rest.indexOf('/');
      if (slashIdx === -1) continue;
      const token = rest.slice(0, slashIdx);
      const publicKey = rest.slice(slashIdx + 1);
      if (token && publicKey) {
        results.push({
          type: 'exchange',
          id: msg.id,
          token,
          publicKey,
          timestamp: ts,
        });
      }
    } else if (body.includes(GUARD_MSG_PREFIX)) {
      const idx = body.indexOf(GUARD_MSG_PREFIX);
      const rest = body.slice(idx + GUARD_MSG_PREFIX.length).trim();
      const slashIdx = rest.indexOf('/');
      if (slashIdx === -1) continue;
      const token = rest.slice(0, slashIdx);
      const content = rest.slice(slashIdx + 1);
      if (token && content) {
        results.push({
          type: 'message',
          id: msg.id,
          token,
          content,
          timestamp: ts,
        });
      }
    }
  }

  return results;
};
