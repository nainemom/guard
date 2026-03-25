import {
  Cancel01Icon,
  Delete01Icon,
  Edit04Icon,
  MoreVerticalIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { type FC, useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { useLocation, useRoute } from 'wouter';
import {
  METHODS as CRYPTO_METHODS,
  getPublicKey,
  type KeyType,
} from '@/crypto';
import { buildKeyValue, db, type ParsedKeyValue, parseKeyValue } from '@/db';
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
import { KeyTypeChip } from './KeyTypeChip';
import { TranslateWorkspace } from './TranslateWorkspace';

// --- Helpers ---

const keyPath = (parsed: ParsedKeyValue) => `/keys/${buildKeyValue(parsed)}`;

const keyShareUrl = (params: ParsedKeyValue) => {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#${keyPath(params)}`;
};

// --- Hook ---
const useParsedKeyValue = () => {
  const [match, params] = useRoute('/keys/:codec/:method/:type/:value');
  const parsed = useMemo(
    () =>
      match && params?.value
        ? parseKeyValue(
            `${params.codec}/${params.method}/${params.type}/${params.value}`,
          )
        : null,
    [match, params?.value, params.codec, params.method, params.type],
  );
  if (!parsed) throw new Error('Unexpected Error!');
  const builded = buildKeyValue(parsed);

  const results = useLiveQuery(
    () => db.keys.where('value').equals(builded).toArray(),
    [builded],
  );

  const saved = results?.[0];

  return useMemo(
    () => ({
      saved,
      parsed,
      builded,
    }),
    [builded, saved, parsed],
  );
};

// --- Page ---

export const KeyDetailsPage: FC = () => {
  const [, navigate] = useLocation();
  const { saved, parsed, builded } = useParsedKeyValue();

  const { share } = useShare();

  const publicKey = useAsync(() => {
    const content = parsed.value;
    if (
      CRYPTO_METHODS[parsed.method].type === 'asymmetric' &&
      parsed.type === 'private'
    ) {
      return getPublicKey(parsed.method, content);
    }
    return Promise.resolve(null);
  }, [parsed.value, parsed.method, parsed.type]);

  const handleDelete = useCallback(async () => {
    if (!saved) return;
    if (!confirm(`Delete "${saved.name}"? This cannot be undone.`)) return;
    await db.keys.delete(saved.value as never);
    navigate('/keys');
  }, [saved, navigate]);

  const handleShare = useCallback(
    (type: KeyType) => {
      if (type === 'private') {
        return share({ text: keyShareUrl(parsed) });
      }
      if (!publicKey.value) throw new Error('Unexpected Error!');
      return share({
        text: keyShareUrl({
          ...parsed,
          type: 'public',
          value: publicKey.value,
        }),
      });
    },
    [share, publicKey.value, parsed],
  );

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(saved?.name ?? '');

  const handleSaveName = useCallback(async () => {
    if (!saved || !draft.trim()) return;
    if (saved) {
      await db.keys.update(saved, {
        name: draft.trim(),
        updatedAt: Date.now(),
      });
    } else {
      await db.keys.add({
        value: builded,
        name: draft.trim(),
        isDeleted: false,
        updatedAt: Date.now(),
      });
    }
    setEditing(false);
  }, [builded, saved, draft]);

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
          before={<Avatar size={32} seed={saved ? saved.name : ''} />}
          title={saved ? saved.name : 'Unsaved'}
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
                  <ListItem
                    size="sm"
                    before={<Icon icon={Edit04Icon} size="sm" />}
                    onClick={() => {
                      close();
                      setDraft(saved?.name ?? '');
                      setEditing(true);
                    }}
                  >
                    <span className="text-sm">
                      {saved ? 'Rename' : 'Save with name'}
                    </span>
                  </ListItem>
                  <div className="my-1 border-t border-border-light" />
                  <ListItem
                    size="sm"
                    after={<KeyTypeChip value="asymmetric-public" />}
                    disabled={!publicKey.value}
                    onClick={() => {
                      close();
                      handleShare('public');
                    }}
                  >
                    <p className="text-sm mb-1">Share Lock</p>
                    <p className="text-xs text-text-secondary">
                      Can encrypt only
                    </p>
                  </ListItem>
                  <ListItem
                    size="sm"
                    after={<KeyTypeChip value="symmetric" />}
                    onClick={() => {
                      close();
                      handleShare('private');
                    }}
                  >
                    <p className="text-sm mb-1">Share Key</p>
                    <p className="text-xs text-text-secondary">
                      Can encrypt/decrypt
                    </p>
                  </ListItem>
                  {saved && (
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

      <TranslateWorkspace parsed={parsed} />
    </Page>
  );
};
