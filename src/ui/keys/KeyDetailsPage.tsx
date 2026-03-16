import {
  Delete01Icon,
  Key01Icon,
  MoreVerticalIcon,
  Share01Icon,
  SquareLock01Icon,
} from '@hugeicons/core-free-icons';
import { type FC, useCallback, useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { METHODS as CODEC_METHODS } from '@/codec';
import { getPublicKey, parseKey } from '@/crypto';
import { db, type Key, useRow } from '@/db';
import {
  Button,
  ButtonGroup,
  ChatBubble,
  Icon,
  Input,
  Page,
  PageBody,
  PageHeader,
  PageToolbar,
  Popover,
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
  <div className="flex flex-col gap-3">
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
              iconOnly
              onClick={onShare}
            >
              <Icon icon={shareIcon} size="sm" />
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
  const key = useRow('keys', keyId);

  const { share } = useShare();
  const [publicKey, setPublicKey] = useState<string>();

  useEffect(() => {
    if (!key) return;
    const parsed = parseKey(key.value);
    if (parsed.method.type === 'asymmetric') {
      getPublicKey(key.value).then(setPublicKey);
    }
  }, [key]);

  const handleDelete = useCallback(() => {
    if (!key || !keyId) return;
    if (!confirm(`Delete "${key.name}"? This cannot be undone.`)) return;
    db.remove('keys', keyId);
    navigate('/keys');
  }, [key, keyId, navigate]);

  const parsed = key ? parseKey(key.value) : null;
  const isAsymmetric = parsed?.method.type === 'asymmetric';

  if (!keyId) return null;

  if (!key) {
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
        after={
          <Popover
            trigger={
              <Button variant="ghost" iconOnly>
                <Icon icon={MoreVerticalIcon} size="lg" />
              </Button>
            }
          >
            {(close) => (
              <div className="min-w-64">
                {isAsymmetric && (
                  <button
                    type="button"
                    disabled={!publicKey}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text text-start transition-colors cursor-pointer hover:bg-surface-alt disabled:opacity-40 disabled:cursor-default"
                    onClick={() => {
                      close();
                      if (publicKey) share({ text: importUrl(publicKey) });
                    }}
                  >
                    <Icon icon={Share01Icon} className="shrink-0" />
                    <div className="flex flex-col">
                      <span>Share Lock</span>
                      <span className="text-xs text-text-muted">
                        Others can encrypt messages for you
                      </span>
                    </div>
                  </button>
                )}
                <button
                  type="button"
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text text-start transition-colors cursor-pointer hover:bg-surface-alt"
                  onClick={() => {
                    close();
                    if (key) share({ text: importUrl(key.value) });
                  }}
                >
                  <Icon icon={Share01Icon} className="shrink-0" />
                  <div className="flex flex-col">
                    <span>Share Key</span>
                    <span className="text-xs text-text-muted">
                      Anyone with this can encrypt and decrypt
                    </span>
                  </div>
                </button>
                <div className="my-1 border-t border-border-light" />
                <button
                  type="button"
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-error text-start transition-colors cursor-pointer hover:bg-surface-alt"
                  onClick={() => {
                    close();
                    handleDelete();
                  }}
                >
                  <Icon icon={Delete01Icon} className="shrink-0" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </Popover>
        }
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
        <ButtonGroup className="px-3 pt-3">
          {codecEntries.map(([id, method]) => (
            <Button
              key={id}
              variant={chat.codec === id ? 'primary' : 'outline'}
              onClick={() => chat.setCodec(id)}
              size="sm"
              className="shrink-0"
            >
              {method.name}
            </Button>
          ))}
        </ButtonGroup>

        <div className="flex items-start gap-3 p-3">
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
          <ButtonGroup>
            {chat.canDecrypt && (
              <Button
                iconOnly
                variant="success"
                disabled={!chat.input.trim() || chat.isProcessing}
                onClick={() => chat.submit('decrypt')}
              >
                <Icon icon={Key01Icon} size="lg" />
              </Button>
            )}
            <Button
              iconOnly
              disabled={!chat.input.trim() || chat.isProcessing}
              onClick={() => chat.submit('encrypt')}
            >
              <Icon icon={SquareLock01Icon} size="lg" />
            </Button>
          </ButtonGroup>
        </div>
      </PageToolbar>
    </>
  );
};
