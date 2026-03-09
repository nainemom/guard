import { Trash } from '@phosphor-icons/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { type FC, useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { getPublicKey, parseKey } from '@/crypto';
import { db } from '@/db';
import {
  Avatar,
  Button,
  Chip,
  Input,
  ListItem,
  LoadingSpinner,
  Page,
  PageBody,
  PageHeader,
  useShare,
} from '@/ui/shared';
import { KeyTypeChip } from './KeyTypeChip';
import { MethodTypeChip } from './MethodTypeChip';

export const KeyEditPage: FC = () => {
  const [, params] = useRoute('/keys/:id/edit');
  const [, navigate] = useLocation();
  const keyId = params?.id;
  const key = useLiveQuery(
    () => (keyId ? db.keys.get(keyId) : undefined),
    [keyId],
  );

  const [name, setName] = useState('');
  const [publicKey, setPublicKey] = useState<string>();
  const { share, shareIcon } = useShare();

  const parsed = key ? parseKey(key.value) : null;
  const isAsymmetric = parsed?.method.type === 'asymmetric';

  useEffect(() => {
    if (key) setName(key.name);
  }, [key?.name, key]);

  useEffect(() => {
    if (key && isAsymmetric) {
      getPublicKey(key.value).then(setPublicKey);
    }
  }, [key?.value, isAsymmetric, key]);

  if (!keyId) return null;

  if (key === undefined) {
    return (
      <Page>
        <PageHeader backTo={`/keys/${keyId}`} title="Key Settings" />
        <LoadingSpinner />
      </Page>
    );
  }

  if (key === null) {
    return (
      <Page>
        <PageHeader backTo="/keys" title="Key Settings" />
        <div className="px-4">
          <p className="text-text-secondary text-center mt-12">
            Key not found.
          </p>
        </div>
      </Page>
    );
  }

  const importUrl = (keyStr: string) => {
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}#/keys/new/${encodeURIComponent(keyStr)}`;
  };

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === key.name) return;
    await db.keys.update(keyId, { name: trimmed });
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${key.name}"? This cannot be undone.`)) return;
    await db.keys.delete(keyId);
    navigate('/keys');
  };

  return (
    <Page>
      <PageHeader backTo={`/keys/${keyId}`} title="Key Settings" />

      <PageBody className="p-4">
        {/* Avatar & Info */}
        <div className="flex flex-col items-center gap-3 pt-2 pb-6">
          <Avatar size={64} seed={name} />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Chip>{parsed?.method.name}</Chip>
            <MethodTypeChip value={parsed?.method.type} />
            <KeyTypeChip value={parsed?.type} />
          </div>
        </div>

        {/* Key Name */}
        <h2 className="text-sm font-semibold text-text-muted tracking-wide mb-2">
          Key Name
        </h2>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          className="mb-8"
        />

        {/* Share */}
        <h2 className="text-sm font-semibold text-text-muted tracking-wide mb-2">
          Share
        </h2>
        <div className="border border-border rounded-lg divide-y divide-border mb-8 overflow-hidden">
          {isAsymmetric ? (
            <>
              <ListItem
                after={<KeyTypeChip value="public" />}
                before={shareIcon('public', 18, 'text-text-muted')}
                onClick={() =>
                  publicKey && share({ text: importUrl(publicKey) }, 'public')
                }
              >
                <p className="font-medium text-sm text-text">
                  Share Public Key
                </p>
                <p className="text-xs text-text-secondary">
                  Give this to others so they can encrypt messages for you
                </p>
              </ListItem>
              <ListItem
                after={<KeyTypeChip value="private" />}
                before={shareIcon('private', 18, 'text-text-muted')}
                onClick={() => share({ text: importUrl(key.value) }, 'private')}
              >
                <p className="font-medium text-sm text-text">
                  Share Private Key
                </p>
                <p className="text-xs text-text-secondary">
                  Only you should have this — it decrypts your messages
                </p>
              </ListItem>
            </>
          ) : (
            <ListItem
              after={<KeyTypeChip value="private" />}
              before={shareIcon('key', 18, 'text-text-muted')}
              onClick={() => share({ text: importUrl(key.value) }, 'key')}
            >
              <p className="font-medium text-sm text-text">Share Key</p>
              <p className="text-xs text-text-secondary">
                Anyone with this key can encrypt and decrypt messages
              </p>
            </ListItem>
          )}
        </div>

        {/* Delete */}
        <Button variant="error" className="w-full py-3" onClick={handleDelete}>
          <Trash size={18} />
          Delete Key
        </Button>
      </PageBody>
    </Page>
  );
};
