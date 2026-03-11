import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as gmail from '@/channels/gmail';
import { decode, encode } from '@/codec';
import { decrypt, encrypt } from '@/crypto';
import { type Conversation, type DirectMessage, db } from '@/db';

export type { DirectMessage };

export const useConversationChat = (conversation: Conversation) => {
  const messages = useLiveQuery(
    () =>
      db.directMessages
        .where('conversationId')
        .equals(conversation.id)
        .sortBy('createdAt'),
    [conversation.id],
  );

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const isPollingRef = useRef(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const send = useCallback(async () => {
    if (
      !input.trim() ||
      isSending ||
      conversation.status !== 'ready' ||
      !conversation.friendPublicKey
    )
      return;

    const text = input.trim();
    setInput('');
    setIsSending(true);

    try {
      const contentBytes = new TextEncoder().encode(text);
      const encrypted = await encrypt(
        contentBytes,
        conversation.friendPublicKey,
      );
      const encoded = (await encode(encrypted, 'base64')) as string;

      const gmailId = await gmail.sendMessage(
        conversation.friendId,
        conversation.token,
        encoded,
      );

      await db.directMessages.add({
        conversationId: conversation.id,
        direction: 'sent',
        text,
        externalId: gmailId,
      } as DirectMessage);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, conversation]);

  const poll = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    setIsPolling(true);

    try {
      const existing = await db.directMessages
        .where('conversationId')
        .equals(conversation.id)
        .toArray();
      const knownIds = new Set(
        existing.map((m) => m.externalId).filter(Boolean) as string[],
      );

      // Also track exchange message IDs to avoid re-processing
      const items = await gmail.receiveAll(conversation.friendId, knownIds);

      for (const item of items) {
        if (
          item.type === 'exchange' &&
          item.token === conversation.token &&
          conversation.status === 'pending'
        ) {
          await db.conversations.update(conversation.id, {
            friendPublicKey: item.publicKey,
            status: 'ready',
          });
        } else if (
          item.type === 'message' &&
          item.token === conversation.token &&
          conversation.status === 'ready'
        ) {
          try {
            const decoded = await decode(item.content, 'base64');
            const decrypted = await decrypt(decoded, conversation.myPrivateKey);
            const text = new TextDecoder().decode(decrypted);

            await db.directMessages.add({
              conversationId: conversation.id,
              direction: 'received',
              text,
              externalId: item.id,
              createdAt: item.timestamp,
            } as DirectMessage);
          } catch {
            // Skip messages that can't be decrypted
          }
        }
      }
    } finally {
      isPollingRef.current = false;
      setIsPolling(false);
    }
  }, [conversation]);

  // Auto-poll on mount and every 30s
  const pollRef = useRef(poll);
  pollRef.current = poll;

  useEffect(() => {
    pollRef.current();
    const interval = setInterval(() => pollRef.current(), 30_000);
    return () => clearInterval(interval);
  }, []);

  return {
    messages: messages ?? [],
    input,
    setInput,
    isSending,
    isPolling,
    send,
    poll,
    scrollAnchorRef,
  };
};
