import {
  CheckmarkCircle02Icon,
  CircleIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { clsx } from 'clsx';
import { type FC, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { METHODS as CODEC_METHODS } from '@/codec';
import {
  generatePrivateKey,
  METHODS,
  type MethodCategory,
  parseKey,
} from '@/crypto';
import { db } from '@/db';
import {
  Button,
  ButtonGroup,
  Chip,
  Icon,
  Input,
  ListItem,
  Page,
  PageBody,
  PageHeader,
  PageToolbar,
  sleep,
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

const codecEntries = Object.entries(CODEC_METHODS) as [
  keyof typeof CODEC_METHODS,
  (typeof CODEC_METHODS)[keyof typeof CODEC_METHODS],
][];

export const KeyCreatePage: FC = () => {
  const [, navigate] = useLocation();
  const params = useParams();
  const urlCodec = params.codec ?? '';
  const urlKey = params.key ? decodeURIComponent(params.key) : undefined;
  const isImport = !!urlKey;

  const [name, setName] = useState('');
  const [method, setMethod] = useState('aes-256-gcm');
  const [codec, setCodec] = useState<string>(
    urlCodec in CODEC_METHODS ? urlCodec : 'base64',
  );
  const [importError, setImportError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Try to parse imported key for preview
  let parsed: ReturnType<typeof parseKey> | null = null;
  try {
    if (urlKey?.trim()) parsed = parseKey(urlKey.trim());
  } catch {
    // invalid key — will show error on submit
  }

  const isValid = isImport
    ? name.trim().length > 0 && parsed !== null
    : name.trim().length > 0 && !!method;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const privateKey = await generatePrivateKey(method);
      db.add('keys', { name: name.trim(), value: privateKey, codec });
      navigate('/keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!urlKey) return;
    setImportError('');
    try {
      parseKey(urlKey.trim());
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid key');
      return;
    }
    setIsLoading(true);
    try {
      db.add('keys', { name: name.trim(), value: urlKey.trim(), codec });
      await sleep(500);
      navigate('/keys');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <PageHeader backTo="/keys" title={isImport ? 'Import Key' : 'New Key'} />

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

        {/* Codec */}
        {!isImport && (
          <>
            <h2 className="text-sm font-semibold text-text-muted tracking-wide mb-2">
              Output Format
            </h2>
            <ButtonGroup contained className="w-full mb-8 shrink-0">
              {codecEntries.map(([id, entry]) => (
                <Button
                  key={id}
                  variant={codec === id ? 'primary' : 'ghost'}
                  className="flex-1"
                  onClick={() => setCodec(id)}
                  size="md"
                >
                  {entry.name}
                </Button>
              ))}
            </ButtonGroup>
          </>
        )}

        {isImport ? (
          <>
            {/* Import preview */}
            {parsed && (
              <div className="flex flex-wrap items-center gap-2">
                <Chip>{parsed.method.name}</Chip>
                <Chip>
                  {CODEC_METHODS[codec as keyof typeof CODEC_METHODS]?.name ??
                    codec}
                </Chip>
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

            {importError && (
              <p className="text-error text-sm mt-3">{importError}</p>
            )}
          </>
        ) : (
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
                              />
                            ) : (
                              <Icon
                                icon={CircleIcon}
                                className="text-text-muted"
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
        )}
      </PageBody>

      {/* Bottom Toolbar */}
      <PageToolbar className="p-4">
        <Button
          size="lg"
          className="w-full"
          disabled={isLoading || !isValid}
          onClick={isImport ? handleImport : handleGenerate}
        >
          {isLoading && <Icon icon={Loading03Icon} className="animate-spin" />}
          {isImport
            ? isLoading
              ? 'Importing Key...'
              : 'Import Key'
            : isLoading
              ? 'Generating Key...'
              : 'Generate Key'}
        </Button>
      </PageToolbar>
    </Page>
  );
};
