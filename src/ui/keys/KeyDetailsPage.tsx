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
  buildKeyValue,
  decodeKeyParams,
  encodeKeyParams,
  type Key,
  type KeyParams,
  useDb,
  useRxQuery,
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
  | { keyValue: string; keyRecord: Key; isSaved: boolean }
  | undefined => {
  const [match, params] = useRoute('/keys/:key');
  const decoded = useMemo(
    () => (match && params?.key ? decodeKeyParams(params.key) : null),
    [match, params?.key],
  );
  const fullValue = decoded ? buildKeyValue(decoded) : '';

  const { data: results } = useRxQuery(
    useCallback(
      (db) => db.keys.find({ selector: { value: fullValue || '__none__' } }),
      [fullValue],
    ),
  );
  const saved = results[0] ?? null;

  return useMemo(() => {
    if (!decoded) return undefined;
    if (saved)
      return { keyValue: saved.value, keyRecord: saved, isSaved: true };
    return {
      keyValue: fullValue,
      keyRecord: {
        value: fullValue,
        codec: decoded.codec,
        name: '',
        updatedAt: Date.now(),
      } as Key,
      isSaved: false,
    };
  }, [decoded, fullValue, saved]);
};

// --- Page ---

export const KeyDetailsPage: FC = () => {
  const [, navigate] = useLocation();
  const database = useDb();
  const resolved = useKeyFromRoute();
  const { share } = useShare();
  const [publicKey, setPublicKey] = useState<string>();

  const key = resolved?.keyRecord;
  const keyValue = resolved?.keyValue;
  const isSaved = resolved?.isSaved ?? false;

  let parsed = null;
  try {
    parsed = key ? parseKey(key.value) : null;
  } catch {
    // invalid key format
  }
  const isAsymmetric = parsed?.method.type === 'asymmetric';

  useEffect(() => {
    if (!key || !isAsymmetric) return;
    getPublicKey(key.value).then(setPublicKey);
  }, [key, isAsymmetric]);

  const handleDelete = useCallback(async () => {
    if (!key || !keyValue) return;
    if (!confirm(`Delete "${key.name}"? This cannot be undone.`)) return;
    const doc = await database.keys.findOne(keyValue).exec();
    await doc?.remove();
    navigate('/keys');
  }, [key, keyValue, database, navigate]);

  const handleShare = useCallback(
    (kv: string, codec: string) => {
      share({ text: keyShareUrl(keyParamsFromValue(codec, kv)) });
    },
    [share],
  );

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(key?.name ?? '');

  const handleSaveName = useCallback(async () => {
    if (!key || !draft.trim()) return;
    if (isSaved) {
      const doc = await database.keys.findOne(key.value).exec();
      await doc?.patch({ name: draft.trim() });
    } else {
      await database.keys.insert({ ...key, name: draft.trim() });
    }
    setEditing(false);
  }, [key, isSaved, draft, database]);

  if (!key || !parsed) {
    return (
      <Page>
        <PageHeader
          backTo="/keys"
          title={key && isSaved ? key.name : 'Invalid Key'}
          after={
            key && isSaved ? (
              <Button variant="ghost" iconOnly onClick={handleDelete}>
                <Icon icon={Delete01Icon} size="lg" className="text-error" />
              </Button>
            ) : undefined
          }
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-text-muted text-sm text-center">
            This key has an invalid or unsupported format.
          </p>
        </div>
      </Page>
    );
  }

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
          before={<Avatar size={32} seed={isSaved ? key.name : ''} />}
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
