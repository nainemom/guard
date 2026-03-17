import {
  Cancel01Icon,
  Delete01Icon,
  Edit04Icon,
  MoreVerticalIcon,
  Share01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { getPublicKey, parseKey } from '@/crypto';
import {
  buildKeyId,
  db,
  decodeKeyParams,
  encodeKeyParams,
  type Key,
  type KeyParams,
  useKey,
} from '@/db';
import {
  Avatar,
  Button,
  Icon,
  ListItem,
  Page,
  PageHeader,
  Popover,
  useShare,
} from '../shared';
import { TranslateWorkspace } from './TranslateWorkspace';

// --- Helpers ---

const keyPath = (params: KeyParams) => `/keys/${encodeKeyParams(params)}`;

const keyShareUrl = (params: KeyParams) => {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#${keyPath(params)}`;
};

const keyParamsFromValue = (codec: string, keyValue: string): KeyParams => {
  const [method, type, value] = keyValue.split(':');
  return { codec, method, type, value };
};

// --- Hook ---

const useKeyFromRoute = ():
  | { keyId: string; keyRecord: Key; isSaved: boolean }
  | undefined => {
  const [match, params] = useRoute('/keys/:key');
  const decoded = useMemo(
    () => (match && params?.key ? decodeKeyParams(params.key) : null),
    [match, params?.key],
  );
  const keyId = decoded ? buildKeyId(decoded) : '';
  const saved = useKey(keyId || undefined);

  return useMemo(() => {
    if (!decoded) return undefined;
    if (saved) return { keyId, keyRecord: saved, isSaved: true };
    return {
      keyId,
      keyRecord: {
        id: keyId,
        name: '',
        value: `${decoded.method}:${decoded.type}:${decoded.value}`,
        codec: decoded.codec,
        method: decoded.method,
        updatedAt: Date.now(),
        syncedAt: null,
      },
      isSaved: false,
    };
  }, [decoded, keyId, saved]);
};

// --- Page ---

export const KeyDetailsPage: FC = () => {
  const [, navigate] = useLocation();
  const resolved = useKeyFromRoute();
  const { share } = useShare();
  const [publicKey, setPublicKey] = useState<string>();

  const key = resolved?.keyRecord;
  const keyId = resolved?.keyId;
  const isSaved = resolved?.isSaved ?? false;

  const parsed = key ? parseKey(key.value) : null;
  const isAsymmetric = parsed?.method.type === 'asymmetric';

  useEffect(() => {
    if (!key || !isAsymmetric) return;
    getPublicKey(key.value).then(setPublicKey);
  }, [key, isAsymmetric]);

  const handleDelete = useCallback(() => {
    if (!key || !keyId) return;
    if (!confirm(`Delete "${key.name}"? This cannot be undone.`)) return;
    db.remove(keyId);
    navigate('/keys');
  }, [key, keyId, navigate]);

  const handleShare = useCallback(
    (keyValue: string, codec: string) => {
      share({ text: keyShareUrl(keyParamsFromValue(codec, keyValue)) });
    },
    [share],
  );

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(key?.name ?? '');

  const handleSaveName = useCallback(() => {
    if (!key || !draft.trim()) return;
    if (isSaved) {
      db.update(key.id, { name: draft.trim() });
    } else {
      db.add({ ...key, name: draft.trim() });
    }
    setEditing(false);
  }, [key, isSaved, draft]);

  if (!key || !parsed) return null;

  return (
    <Page>
      {editing ? (
        <PageHeader
          title=""
          before={
            <>
              <Button
                variant="ghost"
                iconOnly
                className="-ms-2"
                onClick={() => setEditing(false)}
              >
                <Icon icon={Cancel01Icon} size="lg" />
              </Button>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && draft.trim()) handleSaveName();
                  if (e.key === 'Escape') setEditing(false);
                }}
                placeholder="Enter key name..."
                // biome-ignore lint/a11y/noAutofocus: intentional focus on edit mode
                autoFocus
                className="text-lg font-semibold text-text bg-transparent outline-none min-w-0 flex-1 placeholder:text-text-muted placeholder:font-normal"
              />
            </>
          }
          after={
            <Button
              variant="primary_ghost"
              iconOnly
              disabled={!draft.trim()}
              onClick={handleSaveName}
            >
              <Icon icon={Tick01Icon} size="lg" />
            </Button>
          }
        />
      ) : (
        <PageHeader
          backTo="/keys"
          before={
            <Avatar
              size={32}
              seed={isSaved ? key.name : 'unsaved'}
              gray={!key.syncedAt || key.syncedAt < key.updatedAt}
            />
          }
          title={isSaved ? key.name : 'Unsaved'}
          after={
            <Popover
              trigger={
                <Button variant="ghost" iconOnly>
                  <Icon icon={MoreVerticalIcon} size="lg" />
                </Button>
              }
            >
              {(close) => (
                <div className="min-w-48">
                  <ListItem
                    size="sm"
                    before={<Icon icon={Edit04Icon} size="sm" />}
                    onClick={() => {
                      close();
                      setDraft(isSaved ? key.name : '');
                      setEditing(true);
                    }}
                  >
                    <span className="text-sm">
                      {isSaved ? 'Rename' : 'Save with name'}
                    </span>
                  </ListItem>
                  {isAsymmetric && (
                    <ListItem
                      size="sm"
                      before={<Icon icon={Share01Icon} size="sm" />}
                      onClick={() => {
                        close();
                        if (publicKey) handleShare(publicKey, key.codec);
                      }}
                    >
                      <span className="text-sm">Share public</span>
                    </ListItem>
                  )}
                  <ListItem
                    size="sm"
                    before={<Icon icon={Share01Icon} size="sm" />}
                    onClick={() => {
                      close();
                      handleShare(key.value, key.codec);
                    }}
                  >
                    <span className="text-sm">
                      {isAsymmetric ? 'Share private' : 'Share'}
                    </span>
                  </ListItem>
                  {isSaved && (
                    <>
                      <div className="my-1 border-t border-border-light" />
                      <ListItem
                        size="sm"
                        before={
                          <Icon
                            icon={Delete01Icon}
                            size="sm"
                            className="text-error"
                          />
                        }
                        onClick={() => {
                          close();
                          handleDelete();
                        }}
                      >
                        <span className="text-sm text-error">Delete</span>
                      </ListItem>
                    </>
                  )}
                </div>
              )}
            </Popover>
          }
        />
      )}

      <TranslateWorkspace keyRecord={key} parsed={parsed} />
    </Page>
  );
};
