import {
  ArrowRight01Icon,
  CloudDownloadIcon,
  CloudIcon,
  CloudUploadIcon,
  Key01Icon,
  Loading03Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { METHODS as CODEC_METHODS } from '@/codec';
import { parseKey } from '@/crypto';
import {
  db,
  encodeKeyParams,
  useConnected,
  useDirtyCount,
  useKeys,
  useLastSyncTime,
  useSyncing,
} from '@/db';
import {
  Avatar,
  Button,
  Chip,
  Icon,
  ListItem,
  Page,
  PageBody,
  PageHeader,
  Popover,
  useToast,
} from '../shared';
import { KeyTypeChip } from './KeyTypeChip';

const formatRelativeTime = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const KeysListPage: FC = () => {
  const allKeys = useKeys();
  const keys = useMemo(
    () => [...allKeys].sort((a, b) => b.updatedAt - a.updatedAt),
    [allKeys],
  );
  const connected = useConnected();
  const lastSyncTime = useLastSyncTime();
  const syncing = useSyncing();
  const dirtyCount = useDirtyCount();
  const [lastSyncLabel, setLastSyncLabel] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const update = () => {
      setLastSyncLabel(lastSyncTime ? formatRelativeTime(lastSyncTime) : null);
    };
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  const handleBackup = useCallback(async () => {
    try {
      if (!connected) await db.connect();
      await db.push();
      toast.show('Backed up to Google Drive');
    } catch {
      toast.show('Backup failed');
    }
  }, [connected, toast]);

  const handleRestore = useCallback(async () => {
    try {
      if (!connected) await db.connect();
      await db.pull();
      toast.show('Restored from Google Drive');
    } catch {
      toast.show('Restore failed');
    }
  }, [connected, toast]);

  return (
    <Page>
      <PageHeader
        title="Guard"
        after={
          <Popover
            trigger={
              <button
                type="button"
                className="size-9 rounded-full bg-surface-alt border border-border-light flex items-center justify-center cursor-pointer hover:border-primary transition-colors relative"
              >
                {syncing ? (
                  <Icon
                    icon={Loading03Icon}
                    className="text-text-muted animate-spin"
                  />
                ) : (
                  <Icon icon={CloudIcon} className="text-text-muted" />
                )}
                {dirtyCount > 0 && !syncing && (
                  <span className="absolute -top-0.5 -end-0.5 size-2.5 rounded-full bg-primary" />
                )}
              </button>
            }
          >
            {() => (
              <div className="min-w-52">
                <div className="px-3 py-2 border-b border-border-light">
                  <p className="text-xs text-text-muted">
                    {lastSyncLabel
                      ? `Last sync ${lastSyncLabel}`
                      : 'Never synced'}
                    {dirtyCount > 0 && ` · ${dirtyCount} unsaved`}
                  </p>
                </div>
                <ListItem
                  size="sm"
                  before={<Icon icon={CloudUploadIcon} size="sm" />}
                  onClick={handleBackup}
                >
                  <span className="text-sm">Backup to Drive</span>
                </ListItem>
                <ListItem
                  size="sm"
                  before={<Icon icon={CloudDownloadIcon} size="sm" />}
                  onClick={handleRestore}
                >
                  <span className="text-sm">Restore from Drive</span>
                </ListItem>
              </div>
            )}
          </Popover>
        }
      />

      <PageBody>
        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6 pb-16 max-w-96 mx-auto text-center">
            <div className="rounded-full bg-border-light p-5 mb-4">
              <Icon icon={Key01Icon} className="text-text-muted" size="xl" />
            </div>
            <p className="text-text font-medium text-lg">
              You don't have any keys yet
            </p>
            <p className="text-text-muted text-sm mt-1">
              Create your first key by tapping the + button below to get started
              with encryption
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-light">
            {keys.map((key) => {
              const parsed = parseKey(key.value);
              const [, keyType, keyData] = key.value.split(':');
              const keyPath = `/keys/${encodeKeyParams({ codec: key.codec, method: key.method, type: keyType, value: keyData })}`;
              return (
                <Link key={key.id} to={keyPath} asChild>
                  <ListItem
                    before={
                      <Avatar
                        size={48}
                        seed={key.name}
                        gray={!key.syncedAt || key.syncedAt < key.updatedAt}
                      />
                    }
                    after={
                      <>
                        <KeyTypeChip
                          value={
                            parsed.method.type === 'asymmetric'
                              ? parsed.type === 'public'
                                ? 'asymmetric-public'
                                : 'asymmetric'
                              : 'symmetric'
                          }
                        />
                        <Icon
                          icon={ArrowRight01Icon}
                          className="text-text-muted"
                        />
                      </>
                    }
                  >
                    <p className="font-medium truncate text-text">{key.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Chip>{parsed.method.name}</Chip>
                      <Chip>
                        {CODEC_METHODS[key.codec as keyof typeof CODEC_METHODS]
                          ?.name ?? key.codec}
                      </Chip>
                    </div>
                  </ListItem>
                </Link>
              );
            })}
          </div>
        )}
      </PageBody>

      <Link to="/keys/new" asChild>
        <Button
          iconOnly
          size="lg"
          className="fixed bottom-6 right-6 shadow-lg rounded-full"
        >
          <Icon icon={PlusSignIcon} size="lg" />
        </Button>
      </Link>
    </Page>
  );
};
