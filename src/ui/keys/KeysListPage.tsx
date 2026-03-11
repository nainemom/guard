import {
  ArrowRight01Icon,
  CloudIcon,
  CloudOffIcon,
  Key01Icon,
  Loading03Icon,
  PlusSignIcon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { type FC, useCallback, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { parseKey } from '@/crypto';
import { db } from '@/db';
import {
  getLastSyncTime,
  getUserProfile,
  sync,
  connect as syncConnect,
  disconnect as syncDisconnect,
  isConnected as syncIsConnected,
  type UserProfile,
} from '@/sync';
import {
  Avatar,
  Button,
  Icon,
  ListItem,
  LoadingSpinner,
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
  const keys = useLiveQuery(() => db.keys.toArray())?.sort(
    (a, b) => a.createdAt - b.createdAt,
  );
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(syncIsConnected);
  const [profile, setProfile] = useState<UserProfile | null>(getUserProfile);
  const [lastSyncLabel, setLastSyncLabel] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const update = () => {
      const t = getLastSyncTime();
      setLastSyncLabel(t ? formatRelativeTime(t) : null);
    };
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = useCallback(
    async (close: () => void) => {
      try {
        setSyncing(true);
        await syncConnect();
        setConnected(true);
        setProfile(getUserProfile());
        toast.show('Connected to Google Drive');
        close();
      } catch {
        toast.show('Connection failed');
      } finally {
        setSyncing(false);
      }
    },
    [toast],
  );

  const handleDisconnect = useCallback(
    (close: () => void) => {
      syncDisconnect();
      setConnected(false);
      setProfile(null);
      toast.show('Disconnected from Google Drive');
      close();
    },
    [toast],
  );

  const handleSync = useCallback(async () => {
    try {
      setSyncing(true);
      await sync();
      toast.show('Synced with Google Drive');
    } catch {
      toast.show('Sync failed');
    } finally {
      setSyncing(false);
    }
  }, [toast]);

  return (
    <Page>
      <PageHeader
        title="Guard"
        subtitle="List of your keys"
        after={
          <Popover
            trigger={
              connected && profile ? (
                <img
                  src={profile.picture}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="size-9 rounded-full cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all"
                />
              ) : (
                <button
                  type="button"
                  className="size-9 rounded-full bg-surface-alt border border-border-light flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                >
                  <Icon
                    icon={connected ? CloudIcon : UserIcon}
                    size={18}
                    className="text-text-muted"
                  />
                </button>
              )
            }
          >
            {(close) =>
              connected ? (
                <div className="min-w-64">
                  {profile && (
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light">
                      <img
                        src={profile.picture}
                        alt={profile.name}
                        referrerPolicy="no-referrer"
                        className="size-10 rounded-full"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text">
                          {profile.name}
                        </span>
                        <span className="text-xs text-text-muted">
                          Google Drive
                        </span>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={syncing}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-text text-start transition-colors cursor-pointer hover:bg-surface-alt disabled:opacity-40 disabled:cursor-default"
                    onClick={handleSync}
                  >
                    <span className="shrink-0">
                      {syncing ? (
                        <Icon
                          icon={Loading03Icon}
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Icon icon={CloudIcon} size={18} />
                      )}
                    </span>
                    <div className="flex flex-col">
                      <span>Sync now</span>
                      {lastSyncLabel && (
                        <span className="text-xs text-text-muted">
                          Last synced {lastSyncLabel}
                        </span>
                      )}
                    </div>
                  </button>
                  <div className="my-1 border-t border-border-light" />
                  <button
                    type="button"
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-error text-start transition-colors cursor-pointer hover:bg-surface-alt"
                    onClick={() => handleDisconnect(close)}
                  >
                    <span className="shrink-0">
                      <Icon icon={CloudOffIcon} size={18} />
                    </span>
                    <span>Disconnect</span>
                  </button>
                </div>
              ) : (
                <div className="min-w-64 p-4 flex flex-col items-center text-center gap-3">
                  <div className="rounded-full bg-border-light p-3">
                    <Icon
                      icon={UserIcon}
                      size={24}
                      className="text-text-muted"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">
                      Not connected
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Sign in to sync your keys across devices
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    disabled={syncing}
                    onClick={() => handleConnect(close)}
                  >
                    {syncing ? (
                      <Icon
                        icon={Loading03Icon}
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Icon icon={CloudIcon} size={16} />
                    )}
                    Connect Google Drive
                  </Button>
                </div>
              )
            }
          </Popover>
        }
      />

      <PageBody>
        {!keys ? (
          <LoadingSpinner />
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6 pb-16 max-w-96 mx-auto text-center">
            <div className="rounded-full bg-border-light p-5 mb-4">
              <Icon icon={Key01Icon} className="text-text-muted" size={40} />
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
              return (
                <Link key={key.id} to={`/keys/${key.id}`} className="contents">
                  <ListItem
                    before={<Avatar size={48} seed={key.name} />}
                    after={
                      <>
                        <KeyTypeChip
                          value={
                            parsed.method.type === 'asymmetric'
                              ? parsed.type === 'public'
                                ? 'lock'
                                : 'key+lock'
                              : 'key'
                          }
                        />
                        <Icon
                          icon={ArrowRight01Icon}
                          className="text-text-muted"
                          size={20}
                        />
                      </>
                    }
                  >
                    <p className="font-medium truncate text-text">{key.name}</p>
                    <p className="text-sm text-text-secondary">
                      {parsed.method.name}
                    </p>
                  </ListItem>
                </Link>
              );
            })}
          </div>
        )}
      </PageBody>

      <Link to="/keys/new" className="fixed bottom-6 right-6 contents">
        <Button iconOnly className="fixed bottom-6 right-6 size-14 shadow-lg">
          <Icon icon={PlusSignIcon} size={24} />
        </Button>
      </Link>
    </Page>
  );
};
