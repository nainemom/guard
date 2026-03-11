import {
  CheckmarkCircle02Icon,
  CircleIcon,
  Loading03Icon,
  MailAtSign01Icon,
} from '@hugeicons/core-free-icons';
import { clsx } from 'clsx';
import { type FC, useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import * as gmail from '@/channels/gmail';
import {
  generatePrivateKey,
  getPublicKey,
  METHODS,
  type MethodCategory,
} from '@/crypto';
import { db } from '@/db';
import { connect as syncConnect, isConnected as syncIsConnected } from '@/sync';
import {
  Avatar,
  Button,
  Icon,
  ListItem,
  Page,
  PageBody,
  PageHeader,
  PageToolbar,
  useToast,
} from '../shared';

const CATEGORY_ORDER: MethodCategory[] = ['ecdh', 'rsa', 'post-quantum'];

const CATEGORY_LABELS: Record<MethodCategory, string> = {
  standard: 'Standard',
  ecdh: 'Elliptic Curve (ECDH)',
  rsa: 'RSA',
  'post-quantum': 'Post-Quantum',
};

const ASYMMETRIC_GROUPS = Object.entries(METHODS).reduce(
  (acc, [key, method]) => {
    if (method.type !== 'asymmetric') return acc;
    const cat = method.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(key);
    return acc;
  },
  {} as Record<MethodCategory, string[]>,
);

interface InviteData {
  token: string;
  email: string;
  pk: string;
}

const decodeInvite = (encoded: string): InviteData | null => {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const ConversationJoinPage: FC = () => {
  const params = useParams();
  const [, navigate] = useLocation();
  const toast = useToast();
  const [method, setMethod] = useState('ecdh-x25519');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const invite = useMemo(
    () => (params.data ? decodeInvite(params.data) : null),
    [params.data],
  );

  const connected = syncIsConnected();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await syncConnect();
      toast.show('Connected to Google');
    } catch {
      toast.show('Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccept = async () => {
    if (!invite || !connected) return;
    setIsLoading(true);
    try {
      const myPrivateKey = await generatePrivateKey(method);
      const myPublicKey = await getPublicKey(myPrivateKey);

      const id = crypto.randomUUID();

      await db.conversations.add({
        id,
        token: invite.token,
        channel: 'gmail',
        friendId: invite.email,
        myPrivateKey,
        myPublicKey,
        friendPublicKey: invite.pk,
        status: 'ready',
      });

      // Send our public key back to the initiator via email
      await gmail.sendKeyExchange(invite.email, invite.token, myPublicKey);

      toast.show('Conversation created!');
      navigate(`/${id}`);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Failed to accept');
    } finally {
      setIsLoading(false);
    }
  };

  if (!invite) {
    return (
      <Page>
        <PageHeader backTo="/" title="Join" />
        <PageBody className="flex flex-col items-center justify-center px-6 text-center">
          <p className="text-text-muted">Invalid invitation link.</p>
        </PageBody>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader backTo="/" title="Join Conversation" />

      <PageBody className="p-4">
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <Avatar size={72} seed={invite.email} />
          <div>
            <p className="text-text font-medium text-lg">
              Encrypted conversation
            </p>
            <p className="text-text-muted text-sm mt-1">
              <span className="font-medium text-text">{invite.email}</span>{' '}
              invites you to a secure conversation
            </p>
          </div>
        </div>

        {!connected ? (
          <div className="flex flex-col items-center gap-4 py-8 px-4 border border-border rounded-lg">
            <Icon
              icon={MailAtSign01Icon}
              size={32}
              className="text-text-muted"
            />
            <p className="text-sm text-text-muted text-center">
              Connect to Google to accept this invitation and exchange keys via
              Gmail
            </p>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting && (
                <Icon icon={Loading03Icon} size={16} className="animate-spin" />
              )}
              Connect Google
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-text-muted tracking-wide mb-2 mt-4">
              Your Encryption Type
            </h2>
            <p className="text-xs text-text-muted mb-3">
              Choose the encryption algorithm for your side
            </p>
            <div className="border border-border rounded-lg">
              {CATEGORY_ORDER.map((category, i) => {
                const methods = ASYMMETRIC_GROUPS[category];
                if (!methods?.length) return null;
                return (
                  <div key={category}>
                    <div
                      className={clsx(
                        'px-4 py-2 bg-surface-alt text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border',
                        i !== 0 && 'border-t',
                      )}
                    >
                      {CATEGORY_LABELS[category]}
                    </div>
                    {methods.map((key) => {
                      const item = METHODS[key];
                      return (
                        <ListItem
                          key={key}
                          before={
                            key === method ? (
                              <Icon
                                icon={CheckmarkCircle02Icon}
                                className="text-primary"
                                size={18}
                              />
                            ) : (
                              <Icon
                                icon={CircleIcon}
                                className="text-text-muted"
                                size={18}
                              />
                            )
                          }
                          onClick={() => setMethod(key)}
                        >
                          <span className="font-medium text-sm text-text">
                            {item.name}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {item.description}
                          </span>
                        </ListItem>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </PageBody>

      {connected && (
        <PageToolbar className="p-4">
          <Button
            className="w-full py-3"
            disabled={isLoading}
            onClick={handleAccept}
          >
            {isLoading && (
              <Icon icon={Loading03Icon} className="animate-spin" size={18} />
            )}
            {isLoading ? 'Setting up...' : 'Accept & Join'}
          </Button>
        </PageToolbar>
      )}
    </Page>
  );
};
