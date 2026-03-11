import {
  ArrowRight01Icon,
  CloudIcon,
  CloudOffIcon,
  Loading03Icon,
  MailAtSign01Icon,
  PlusSignIcon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { type FC, useCallback, useState } from 'react';
import { Link } from 'wouter';
import { db } from '@/db';
import {
  getUserProfile,
  connect as syncConnect,
  disconnect as syncDisconnect,
  isConnected as syncIsConnected,
  type UserProfile,
} from '@/sync';
import {
  Avatar,
  Button,
  Chip,
  Icon,
  ListItem,
  LoadingSpinner,
  Page,
  PageBody,
  PageHeader,
  Popover,
  useToast,
} from '../shared';

export const ConversationsListPage: FC = () => {
  const conversations = useLiveQuery(() =>
    db.conversations
      .filter((c) => !c.deletedAt)
      .sortBy('updatedAt')
      .then((arr) => arr.reverse()),
  );
  const [connected, setConnected] = useState(syncIsConnected);
  const [profile, setProfile] = useState<UserProfile | null>(getUserProfile);
  const [syncing, setSyncing] = useState(false);
  const toast = useToast();

  const handleConnect = useCallback(
    async (close: () => void) => {
      try {
        setSyncing(true);
        await syncConnect();
        setConnected(true);
        setProfile(getUserProfile());
        toast.show('Connected to Google');
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
      toast.show('Disconnected');
      close();
    },
    [toast],
  );

  return (
    <Page>
      <PageHeader
        title="Guard"
        subtitle="Conversations"
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
                          {profile.email}
                        </span>
                      </div>
                    </div>
                  )}
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
                      Sign in with Google to send and receive encrypted messages
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
                    Connect Google
                  </Button>
                </div>
              )
            }
          </Popover>
        }
      />

      <PageBody>
        {!conversations ? (
          <LoadingSpinner />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6 pb-16 max-w-96 mx-auto text-center">
            <div className="rounded-full bg-border-light p-5 mb-4">
              <Icon
                icon={MailAtSign01Icon}
                className="text-text-muted"
                size={40}
              />
            </div>
            <p className="text-text font-medium text-lg">
              No conversations yet
            </p>
            <p className="text-text-muted text-sm mt-1">
              Create a conversation to start exchanging encrypted messages via
              Gmail
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-light">
            {conversations.map((conv) => (
              <Link key={conv.id} to={`/${conv.id}`} className="contents">
                <ListItem
                  before={<Avatar size={48} seed={conv.friendId} />}
                  after={
                    <>
                      <Chip
                        className={
                          conv.status === 'ready'
                            ? 'bg-success/15 text-success'
                            : 'bg-primary/15 text-primary'
                        }
                      >
                        {conv.status}
                      </Chip>
                      <Icon
                        icon={ArrowRight01Icon}
                        className="text-text-muted"
                        size={20}
                      />
                    </>
                  }
                >
                  <p className="font-medium truncate text-text">
                    {conv.friendId}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {conv.status === 'pending'
                      ? 'Waiting for key exchange'
                      : 'Encrypted'}
                  </p>
                </ListItem>
              </Link>
            ))}
          </div>
        )}
      </PageBody>

      <Link to="/new" className="fixed bottom-6 right-6 contents">
        <Button iconOnly className="fixed bottom-6 right-6 size-14 shadow-lg">
          <Icon icon={PlusSignIcon} size={24} />
        </Button>
      </Link>
    </Page>
  );
};
