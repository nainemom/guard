import {
  CheckmarkCircle02Icon,
  CircleIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { clsx } from 'clsx';
import { type FC, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  generatePrivateKey,
  METHODS,
  type MethodCategory,
  parseKey,
} from '@/crypto';
import { db } from '@/db';
import {
  Button,
  Chip,
  Icon,
  Input,
  ListItem,
  Page,
  PageBody,
  PageHeader,
  PageToolbar,
  sleep,
  Tabs,
} from '../shared';
import { KeyTypeChip } from './KeyTypeChip';

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

const MODE_TABS = [
  { id: 'generate', label: 'Generate' },
  { id: 'import', label: 'Import' },
];

export const KeyCreatePage: FC = () => {
  const [, navigate] = useLocation();
  const params = useParams();
  const urlKey = params.key ? decodeURIComponent(params.key) : undefined;
  const [mode, setMode] = useState(urlKey ? 'import' : 'generate');
  const [name, setName] = useState('');
  const [method, setMethod] = useState('aes-256-gcm');
  const [keyValue, setKeyValue] = useState(urlKey ?? '');
  const [importError, setImportError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Try to parse imported key for preview
  let parsed: ReturnType<typeof parseKey> | null = null;
  try {
    if (keyValue.trim()) parsed = parseKey(keyValue.trim());
  } catch {
    // invalid key — will show error on submit
  }

  const isGenerateValid = name.trim().length > 0 && !!method;
  const isImportValid = name.trim().length > 0 && parsed !== null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const privateKey = await generatePrivateKey(method);
      await db.keys.add({ name: name.trim(), value: privateKey });
      await sleep(2000);
      navigate('/keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    setImportError('');
    try {
      parseKey(keyValue.trim());
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid key');
      return;
    }
    setIsLoading(true);
    try {
      await db.keys.add({ name: name.trim(), value: keyValue.trim() });
      await sleep(500);
      navigate('/keys');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <PageHeader backTo="/keys" title="New Key" />

      <PageBody className="p-4">
        {/* Mode Tabs */}
        <Tabs
          items={MODE_TABS}
          value={mode}
          onChange={setMode}
          className="mb-8"
        />

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

        {mode === 'generate' ? (
          <>
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
                          after={
                            <KeyTypeChip
                              value={
                                item.type === 'symmetric' ? 'key' : 'key+lock'
                              }
                            />
                          }
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
          </>
        ) : (
          <>
            {/* Key Value */}
            <h2 className="text-sm font-semibold text-text-muted tracking-wide mb-2">
              Key Value
            </h2>
            <Input
              multiline
              rows={3}
              placeholder="Paste key string here..."
              value={keyValue}
              onInput={(e) => {
                setKeyValue(e.currentTarget.value);
                setImportError('');
              }}
              className="mt-1 font-mono text-xs min-h-64"
            />

            {/* Parsed preview */}
            {parsed && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Chip>{parsed.method.name}</Chip>
                <KeyTypeChip
                  value={
                    parsed.method.type === 'asymmetric'
                      ? parsed.type === 'public'
                        ? 'lock'
                        : 'key+lock'
                      : 'key'
                  }
                />
              </div>
            )}

            {/* Error */}
            {importError && (
              <p className="text-error text-sm mt-3">{importError}</p>
            )}
          </>
        )}
      </PageBody>

      {/* Bottom Toolbar */}
      <PageToolbar className="p-4">
        <Button
          className="w-full py-3"
          disabled={
            isLoading ||
            (mode === 'generate' ? !isGenerateValid : !isImportValid)
          }
          onClick={mode === 'generate' ? handleGenerate : handleImport}
        >
          {isLoading && (
            <Icon icon={Loading03Icon} className="animate-spin" size={18} />
          )}
          {mode === 'generate'
            ? isLoading
              ? 'Generating Key...'
              : 'Generate Key'
            : isLoading
              ? 'Importing Key...'
              : 'Import Key'}
        </Button>
      </PageToolbar>
    </Page>
  );
};
