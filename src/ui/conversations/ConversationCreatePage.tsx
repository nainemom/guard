import {
  CheckmarkCircle02Icon,
  CircleIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { clsx } from 'clsx';
import { type FC, useState } from 'react';
import { useLocation } from 'wouter';
import {
  generatePrivateKey,
  getPublicKey,
  METHODS,
  type MethodCategory,
} from '@/crypto';
import { db } from '@/db';
import {
  Button,
  Icon,
  Input,
  ListItem,
  Page,
  PageBody,
  PageHeader,
  PageToolbar,
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

export const ConversationCreatePage: FC = () => {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState('ecdh-x25519');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.trim().length > 0 && !!method;

  const handleCreate = async () => {
    if (!isValid) return;
    setIsLoading(true);
    try {
      const myPrivateKey = await generatePrivateKey(method);
      const myPublicKey = await getPublicKey(myPrivateKey);

      const id = crypto.randomUUID();
      const token = crypto.randomUUID();

      await db.conversations.add({
        id,
        token,
        channel: 'gmail',
        friendId: email.trim(),
        myPrivateKey,
        myPublicKey,
        status: 'pending',
      });

      navigate(`/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <PageHeader backTo="/" title="New Conversation" />

      <PageBody className="p-4">
        <h2 className="text-sm font-semibold text-text-muted tracking-wide mb-2">
          Friend's Email
        </h2>
        <Input
          type="email"
          autoFocus
          placeholder="e.g. alice@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 mb-8"
        />

        <h2 className="text-sm font-semibold text-text-muted tracking-wide mb-2">
          Encryption Type
        </h2>
        <p className="text-xs text-text-muted mb-3">
          Choose the encryption algorithm for this conversation
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
      </PageBody>

      <PageToolbar className="p-4">
        <Button
          className="w-full py-3"
          disabled={isLoading || !isValid}
          onClick={handleCreate}
        >
          {isLoading && (
            <Icon icon={Loading03Icon} className="animate-spin" size={18} />
          )}
          {isLoading ? 'Generating key...' : 'Create Conversation'}
        </Button>
      </PageToolbar>
    </Page>
  );
};
