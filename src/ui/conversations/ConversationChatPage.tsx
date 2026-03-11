import {
  Delete01Icon,
  Loading03Icon,
  RefreshIcon,
  SentIcon,
  SquareLock01Icon,
} from '@hugeicons/core-free-icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { type FC, useCallback, useMemo, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import * as gmail from '@/channels/gmail';
import { db } from '@/db';
import { getUserProfile, isConnected as syncIsConnected } from '@/sync';
import {
  Avatar,
  Button,
  ChatBubble,
  Chip,
  Icon,
  Input,
  LoadingSpinner,
  Menu,
  Page,
  PageBody,
  PageHeader,
  PageToolbar,
  shareIcon,
  useShare,
  useToast,
} from '../shared';
import { type DirectMessage, useConversationChat } from './useConversationChat';

const createInviteUrl = (token: string, email: string, publicKey: string) => {
  const data = JSON.stringify({ token, email, pk: publicKey });
  const encoded = btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/join/${encoded}`;
};

const MessageBubble: FC<{ msg: DirectMessage }> = ({ msg }) => (
  <ChatBubble position={msg.direction === 'sent' ? 'end' : 'start'}>
    <span className="text-text">{msg.text}</span>
  </ChatBubble>
);

export const ConversationChatPage: FC = () => {
  const [, params] = useRoute('/:id');
  const [, navigate] = useLocation();
  const convId = params?.id;
  const toast = useToast();
  const { share } = useShare();

  const conversation = useLiveQuery(
    () =>
      convId
        ? db.conversations.get(convId).then((c) => (c?.deletedAt ? null : c))
        : undefined,
    [convId],
  );

  const handleDelete = useCallback(async () => {
    if (!conversation || !convId) return;
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    await db.conversations.update(convId, { deletedAt: Date.now() });
    navigate('/');
  }, [conversation, convId, navigate]);

  const menuItems = useMemo(
    () => [
      {
        label: 'Delete',
        icon: <Icon icon={Delete01Icon} size={18} />,
        onClick: handleDelete,
        danger: true,
      },
    ],
    [handleDelete],
  );

  if (!convId) return null;

  if (conversation === undefined) {
    return (
      <Page>
        <PageHeader backTo="/" title="Conversation" />
        <LoadingSpinner />
      </Page>
    );
  }

  if (conversation === null) {
    return (
      <Page>
        <PageHeader backTo="/" title="Conversation" />
        <div className="px-4">
          <p className="text-text-secondary text-center mt-12">
            Conversation not found.
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        backTo="/"
        title={conversation.friendId}
        before={<Avatar size={32} seed={conversation.friendId} />}
        after={
          <>
            <Chip
              className={
                conversation.status === 'ready'
                  ? 'bg-success/15 text-success'
                  : 'bg-primary/15 text-primary'
              }
            >
              {conversation.status}
            </Chip>
            <Menu items={menuItems} />
          </>
        }
      />
      {conversation.status === 'pending' ? (
        <PendingView conversation={conversation} toast={toast} share={share} />
      ) : (
        <ReadyView conversation={conversation} toast={toast} />
      )}
    </Page>
  );
};

const PendingView: FC<{
  conversation: NonNullable<Awaited<ReturnType<typeof db.conversations.get>>>;
  toast: ReturnType<typeof useToast>;
  share: ReturnType<typeof useShare>['share'];
}> = ({ conversation, toast, share }) => {
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const connected = syncIsConnected();

  const profile = getUserProfile();
  const inviteUrl = createInviteUrl(
    conversation.token,
    profile?.email ?? '',
    conversation.myPublicKey,
  );

  const handleCheck = useCallback(async () => {
    setChecking(true);
    try {
      const items = await gmail.receiveAll(conversation.friendId, new Set());
      const exchange = items.find(
        (i) => i.type === 'exchange' && i.token === conversation.token,
      );
      if (exchange && exchange.type === 'exchange') {
        await db.conversations.update(conversation.id, {
          friendPublicKey: exchange.publicKey,
          status: 'ready',
        });
        toast.show('Key exchange complete!');
      } else {
        toast.show('No response yet');
      }
    } catch {
      toast.show('Check failed');
    } finally {
      setChecking(false);
    }
  }, [conversation, toast]);

  const handleSendInvite = useCallback(async () => {
    if (!connected) {
      toast.show('Connect to Google first');
      return;
    }
    setSending(true);
    try {
      await gmail.sendInvite(conversation.friendId, inviteUrl);
      toast.show('Invitation sent!');
    } catch {
      toast.show('Failed to send invitation');
    } finally {
      setSending(false);
    }
  }, [conversation, inviteUrl, connected, toast]);

  return (
    <PageBody className="flex flex-col items-center px-6 pt-12 text-center gap-6">
      <Avatar size={80} seed={conversation.friendId} />

      <div>
        <p className="text-text font-medium text-lg">Waiting for response</p>
        <p className="text-text-muted text-sm mt-1">
          Share the invitation with{' '}
          <span className="font-medium text-text">{conversation.friendId}</span>{' '}
          so they can join this conversation.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-80">
        <Button
          onClick={handleSendInvite}
          disabled={sending}
          className="w-full"
        >
          {sending ? (
            <Icon icon={Loading03Icon} size={16} className="animate-spin" />
          ) : (
            <Icon icon={SentIcon} size={16} />
          )}
          Send invitation via email
        </Button>
        <Button
          variant="outline"
          onClick={() => share({ text: inviteUrl })}
          className="w-full"
        >
          <Icon icon={shareIcon} size={16} />
          Copy invitation link
        </Button>
      </div>

      <div className="border-t border-border-light w-full max-w-80 pt-4">
        <Button
          variant="ghost"
          onClick={handleCheck}
          disabled={checking}
          className="w-full"
        >
          {checking ? (
            <Icon icon={Loading03Icon} size={16} className="animate-spin" />
          ) : (
            <Icon icon={RefreshIcon} size={16} />
          )}
          {checking ? 'Checking...' : 'Check for response'}
        </Button>
      </div>
    </PageBody>
  );
};

const ReadyView: FC<{
  conversation: NonNullable<Awaited<ReturnType<typeof db.conversations.get>>>;
  toast: ReturnType<typeof useToast>;
}> = ({ conversation, toast }) => {
  const chat = useConversationChat(conversation);

  const handleSend = useCallback(async () => {
    try {
      await chat.send();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Send failed');
    }
  }, [chat, toast]);

  const handlePoll = useCallback(async () => {
    try {
      await chat.poll();
      toast.show('Checked for messages');
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Check failed');
    }
  }, [chat, toast]);

  return (
    <>
      <PageBody className="px-4 pb-4">
        <div className="flex flex-col gap-3 pt-4">
          {chat.messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </div>
        <div ref={chat.scrollAnchorRef} />
      </PageBody>

      <PageToolbar className="bg-surface">
        <div className="flex items-center gap-1 px-3 pt-2">
          <button
            type="button"
            disabled={chat.isPolling}
            onClick={handlePoll}
            className="text-xs text-primary font-medium disabled:opacity-40 cursor-pointer"
          >
            {chat.isPolling ? 'Checking...' : 'Check new messages'}
          </button>
        </div>
        <div className="flex items-start gap-2 p-3">
          <Input
            multiline
            autoGrow={120}
            rows={1}
            className="flex-1 rounded-xl"
            placeholder="Type your message..."
            value={chat.input}
            onInput={(e) => chat.setInput(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            iconOnly
            disabled={!chat.input.trim() || chat.isSending}
            onClick={handleSend}
            className="size-10"
          >
            {chat.isSending ? (
              <Icon icon={Loading03Icon} size={22} className="animate-spin" />
            ) : (
              <Icon icon={SquareLock01Icon} size={22} />
            )}
          </Button>
        </div>
      </PageToolbar>
    </>
  );
};
