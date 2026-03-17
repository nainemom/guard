import {
  Cancel01Icon,
  Delete01Icon,
  Edit04Icon,
  MoreVerticalIcon,
  Share01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { useLocation } from 'wouter';
import { getPublicKey, parseKey } from '@/crypto';
import { buildKeyId, db, type Key, useRow } from '@/db';
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

const keyShareUrl = (
  codec: string,
  method: string,
  type: string,
  value: string,
) => {
  const base = `${window.location.origin}${window.location.pathname}`;
  const params = new URLSearchParams({ codec, method, type, value });
  params.sort();
  return `${base}#/keys/details?${params}`;
};

// --- Hook ---

const subscribeHash = (cb: () => void) => {
  addEventListener('hashchange', cb);
  return () => removeEventListener('hashchange', cb);
};
const getHash = () => location.hash;

const useKeyFromHash = ():
  | { keyId: string; keyRecord: Key; isSaved: boolean }
  | undefined => {
  const rawHash = useSyncExternalStore(subscribeHash, getHash);
  const hash = rawHash.replace(/^#?\/?/, '');
  const idx = hash.indexOf('?');
  const p = idx !== -1 ? new URLSearchParams(hash.slice(idx)) : null;
  const codec = p?.get('codec') ?? '';
  const method = p?.get('method') ?? '';
  const type = p?.get('type') ?? '';
  const value = p?.get('value') ?? '';
  const valid = !!(codec && method && type && value);
  const keyId = valid ? buildKeyId(codec, method, type, value) : '';
  const saved = useRow('keys', keyId || undefined);

  return useMemo(() => {
    if (!valid) return undefined;
    if (saved) return { keyId, keyRecord: saved, isSaved: true };
    return {
      keyId,
      keyRecord: {
        id: keyId,
        name: '',
        value: `${method}:${type}:${value}`,
        codec,
        method,
        updatedAt: Date.now(),
      },
      isSaved: false,
    };
  }, [valid, keyId, saved, codec, method, type, value]);
};

// --- Page ---

export const KeyDetailsPage: FC = () => {
  const [, navigate] = useLocation();
  const resolved = useKeyFromHash();
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
    db.remove('keys', keyId);
    navigate('/keys');
  }, [key, keyId, navigate]);

  const handleShare = useCallback(
    (keyValue: string, codec: string) => {
      const [method, type, data] = keyValue.split(':');
      share({ text: keyShareUrl(codec, method, type, data) });
    },
    [share],
  );

  const [editing, setEditing] = useState(!isSaved);
  const [draft, setDraft] = useState(key?.name ?? '');

  const handleSaveName = useCallback(() => {
    if (!key || !draft.trim()) return;
    if (isSaved) {
      db.update('keys', key.id, { name: draft.trim() });
    } else {
      db.add('keys', { ...key, name: draft.trim() });
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
          before={<Avatar size={32} seed={isSaved ? key.name : 'unsaved'} />}
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
