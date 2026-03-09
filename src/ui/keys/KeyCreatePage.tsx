import { CheckCircle, Circle, SpinnerGap } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { type FC, useState } from 'react';
import { useLocation } from 'wouter';
import { generatePrivateKey, METHODS, type MethodCategory } from '@/crypto';
import {
  Button,
  Input,
  ListItem,
  Page,
  PageBody,
  PageHeader,
  PageToolbar,
} from '@/ui/shared';
import { db } from '../../db';
import { sleep } from '../shared/sleep';
import { MethodTypeChip } from './MethodTypeChip';

const CATEGORY_ORDER: MethodCategory[] = [
  'standard',
  'rsa',
  'ecdh',
  'post-quantum',
];

const CATEGORY_LABELS: Record<MethodCategory, string> = {
  standard: 'Standard',
  ecdh: 'Elliptic Curve (ECDH)',
  rsa: 'RSA',
  'post-quantum': 'Post-Quantum',
};

const METHOD_GROUPS = Object.entries(METHODS).reduce(
  (acc, [key, method]) => {
    const cat = method.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(key);
    return acc;
  },
  {} as Record<MethodCategory, string[]>,
);

export const KeyCreatePage: FC = () => {
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const [method, setMethod] = useState('aes-256-gcm');
  const [isLoading, setIsLoading] = useState(false);
  const isValid = name.trim().length > 0 && !!method;

  return (
    <Page>
      {/* Navbar */}
      <PageHeader backTo="/keys" title="Create New Key" />

      {/* Content */}
      <PageBody className="p-4">
        {/* Key Name */}
        <h2 className="text-sm font-semibold text-text-muted tracking-wide mb-2">
          Key Name
        </h2>
        <Input
          id="key-name-input"
          type="text"
          autoFocus
          placeholder="e.g. My Personal Key"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 mb-8"
        />

        {/* Encryption Type */}
        <h2 className="text-sm font-semibold text-text-muted tracking-wide mb-2">
          Encryption Type
        </h2>
        <div className="border border-border rounded-lg">
          {CATEGORY_ORDER.map((category, i) => {
            const methods = METHOD_GROUPS[category];
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
                          <CheckCircle
                            className="text-primary"
                            weight="fill"
                            size={18}
                          />
                        ) : (
                          <Circle className="text-text-muted" size={18} />
                        )
                      }
                      after={<MethodTypeChip value={item.type} />}
                      onClick={() => setMethod(key)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-text">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        {item.description}
                      </div>
                    </ListItem>
                  );
                })}
              </div>
            );
          })}
        </div>
      </PageBody>

      {/* Bottom Toolbar */}
      <PageToolbar className="p-4">
        <Button
          className="w-full py-3"
          disabled={!isValid || isLoading}
          onClick={async () => {
            setIsLoading(true);
            try {
              const privateKey = await generatePrivateKey(method);
              await db.keys.add({
                name: name.trim(),
                value: privateKey,
              });
              await sleep(2000);
              navigate('/keys');
            } finally {
              setIsLoading(false);
            }
          }}
        >
          {isLoading && <SpinnerGap className="animate-spin" size={18} />}
          {isLoading ? 'Generating Key...' : 'Create Key'}
        </Button>
      </PageToolbar>
    </Page>
  );
};
