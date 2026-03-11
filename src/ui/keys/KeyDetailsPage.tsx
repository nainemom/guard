import {
  Delete01Icon,
  Key01Icon,
  Share01Icon,
  SquareLock01Icon,
} from '@hugeicons/core-free-icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { METHODS as CODEC_METHODS } from '@/codec';
import { getPublicKey, parseKey } from '@/crypto';
import { db, type Key } from '@/db';
import {
  Button,
  ChatBubble,
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
} from '../shared';
import { KeyInfoCard } from './KeyInfoCard';
import { type Message, useEncryptChat } from './useEncryptChat';

const codecEntries = Object.entries(CODEC_METHODS) as [
  keyof typeof CODEC_METHODS,
  (typeof CODEC_METHODS)[keyof typeof CODEC_METHODS],
][];

const importUrl = (keyStr: string) => {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/keys/new/${encodeURIComponent(keyStr)}`;
};

const MessageBubble: FC<{
  msg: Message;
  onShare: () => void;
}> = ({ msg, onShare }) => (
  <div className="flex flex-col gap-1">
    <ChatBubble
      position="end"
      header={
        <>
          {msg.operation === 'encrypt' ? 'Encrypt' : 'Decrypt'}
          {' · '}
          {CODEC_METHODS[msg.codec as keyof typeof CODEC_METHODS]?.name ??
            msg.codec}
        </>
      }
    >
      {msg.input}
    </ChatBubble>

    {msg.status === 'error' ? (
      <ChatBubble variant="error" header="Error">
        {msg.error}
      </ChatBubble>
    ) : (
      <ChatBubble
        footer={
          msg.output ? (
            <Button
              variant="ghost"
              className="text-primary p-1 rounded"
              onClick={onShare}
            >
              <Icon icon={shareIcon} size={18} />
            </Button>
          ) : undefined
        }
      >
        <span className="text-text">{msg.output}</span>
      </ChatBubble>
    )}
  </div>
);

export const KeyDetailsPage: FC = () => {
  const [, params] = useRoute('/keys/:id');
  const [, navigate] = useLocation();
  const keyId = params?.id;
  const key = useLiveQuery(
    () => (keyId ? db.keys.get(keyId) : undefined),
    [keyId],
  );

  const { share } = useShare();
  const [publicKey, setPublicKey] = useState<string>();

  useEffect(() => {
    if (!key) return;
    const parsed = parseKey(key.value);
    if (parsed.method.type === 'asymmetric') {
      getPublicKey(key.value).then(setPublicKey);
    }
  }, [key]);

  const handleDelete = useCallback(async () => {
    if (!key || !keyId) return;
    if (!confirm(`Delete "${key.name}"? This cannot be undone.`)) return;
    await db.keys.delete(keyId);
    navigate('/keys');
  }, [key, keyId, navigate]);

  const menuItems = useMemo(() => {
    const parsed = key ? parseKey(key.value) : null;
    const isAsymmetric = parsed?.method.type === 'asymmetric';

    return [
      ...(isAsymmetric
        ? [
            {
              label: 'Share Lock',
              description: 'Others can encrypt messages for you',
              icon: <Icon icon={Share01Icon} size={18} />,
              onClick: () => publicKey && share({ text: importUrl(publicKey) }),
              disabled: !publicKey,
            },
            {
              label: 'Share Key',
              description: 'Anyone with this can encrypt and decrypt',
              icon: <Icon icon={Share01Icon} size={18} />,
              onClick: () => key && share({ text: importUrl(key.value) }),
            },
          ]
        : [
            {
              label: 'Share Key',
              description: 'Anyone with this can encrypt and decrypt',
              icon: <Icon icon={Share01Icon} size={18} />,
              onClick: () => key && share({ text: importUrl(key.value) }),
            },
          ]),
      'divider' as const,
      {
        label: 'Delete',
        icon: <Icon icon={Delete01Icon} size={18} />,
        onClick: handleDelete,
        danger: true,
      },
    ];
  }, [key, publicKey, share, handleDelete]);

  if (!keyId) return null;

  if (key === undefined) {
    return (
      <Page>
        <PageHeader backTo="/keys" title="Key Details" />
        <LoadingSpinner />
      </Page>
    );
  }

  if (key === null) {
    return (
      <Page>
        <PageHeader backTo="/keys" title="Key Details" />
        <div className="px-4">
          <p className="text-text-secondary text-center mt-12">
            Key not found.
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        backTo="/keys"
        title={key.name}
        after={<Menu items={menuItems} />}
      />
      <KeyDetailsContent keyRecord={key} />
    </Page>
  );
};

const KeyDetailsContent: FC<{ keyRecord: Key }> = ({ keyRecord }) => {
  const { share } = useShare();
  const chat = useEncryptChat(keyRecord, CODEC_METHODS);

  return (
    <>
      <PageBody className="px-4 pb-4">
        <KeyInfoCard keyRecord={keyRecord} />

        <div className="flex flex-col gap-3">
          {chat.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onShare={() => share({ text: msg.output ?? '' })}
            />
          ))}
        </div>
        <div ref={chat.scrollAnchorRef} />
      </PageBody>

      <PageToolbar className="bg-surface">
        <div className="flex gap-1 overflow-x-auto px-4 pt-2">
          {codecEntries.map(([id, method]) => (
            <Button
              key={id}
              variant={chat.codec === id ? 'primary' : 'outline'}
              onClick={() => chat.setCodec(id)}
              className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
            >
              {method.name}
            </Button>
          ))}
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
                chat.submit('encrypt');
              }
            }}
          />
          {chat.canDecrypt && (
            <Button
              iconOnly
              variant="success"
              disabled={!chat.input.trim() || chat.isProcessing}
              onClick={() => chat.submit('decrypt')}
              className="size-10"
            >
              <Icon icon={Key01Icon} size={22} />
            </Button>
          )}
          <Button
            iconOnly
            disabled={!chat.input.trim() || chat.isProcessing}
            onClick={() => chat.submit('encrypt')}
            className="size-10"
          >
            <Icon icon={SquareLock01Icon} size={22} />
          </Button>
        </div>
      </PageToolbar>
    </>
  );
};
