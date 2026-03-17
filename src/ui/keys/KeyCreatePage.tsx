import {
  CheckmarkCircle02Icon,
  CircleIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { type FC, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { useLocation } from 'wouter';
import {
  METHODS as CODEC_METHODS,
  type MethodCategory as CodecMethodCategory,
} from '@/codec';
import {
  METHODS as CRYPTO_METHODS,
  type MethodCategory as CryptoMethodCategory,
  generatePrivateKey,
} from '@/crypto';
import { buildKeyId, db, encodeKeyParams } from '@/db';
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
import { KeyTypeChip } from './KeyTypeChip';

const CRYPTO_CATEGORY_GROUP: Record<CryptoMethodCategory, string> = {
  standard: 'Standard',
  ecdh: 'Elliptic Curve (ECDH)',
  rsa: 'RSA',
  'post-quantum': 'Post-Quantum',
};

const CODEC_CATEGORY_GROUP: Record<CodecMethodCategory, string> = {
  text: 'Text',
  image: 'Image',
};

interface FormValues {
  name: string;
  method: string;
  codec: string;
}

export const KeyCreatePage: FC = () => {
  const [, navigate] = useLocation();

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      method: 'aes-256-gcm',
      codec: 'base64',
    },
  });

  const method = watch('method');
  const codec = watch('codec');

  const onSubmit = useCallback(
    async (data: FormValues) => {
      const value = await generatePrivateKey(data.method);
      const [, keyType, keyData] = value.split(':');
      const params = {
        codec: data.codec,
        method: data.method,
        type: keyType,
        value: keyData,
      };
      db.add('keys', {
        id: buildKeyId(params),
        name: data.name.trim(),
        value,
        codec: data.codec,
        method: data.method,
      });
      navigate(`/keys/${encodeKeyParams(params)}`);
    },
    [navigate],
  );

  return (
    <Page>
      <PageHeader backTo="/keys" title="New Key" />

      <form onSubmit={handleSubmit(onSubmit)} className="contents">
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
            {...register('name', {
              required: true,
              validate: (v) => v.trim().length > 0,
            })}
            className="mt-1 mb-8"
          />

          {/* Codec */}
          <h2 className="text-sm font-semibold text-text-muted tracking-wide mb-2">
            Output Format
          </h2>
          <div className="border border-border rounded-lg overflow-hidden shrink-0 mb-8">
            {Object.entries(CODEC_CATEGORY_GROUP).map(
              ([codecCategory, codecCategoryLabel], i) => (
                <div key={codecCategory}>
                  <div
                    className={twMerge(
                      'px-4 py-2 bg-surface-alt text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border',
                      i !== 0 && 'border-t',
                    )}
                  >
                    {codecCategoryLabel}
                  </div>
                  {Object.entries(CODEC_METHODS)
                    .filter(([, m]) => m.category === codecCategory)
                    .map(([codecId, codecObject]) => (
                      <ListItem
                        key={codecId}
                        before={
                          codecId === codec ? (
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
                        onClick={() => setValue('codec', codecId)}
                      >
                        <h3 className="font-medium text-sm text-text mb-1">
                          {codecObject.name}
                        </h3>
                        <p className="text-xs text-text-secondary">
                          {codecObject.description}
                        </p>
                      </ListItem>
                    ))}
                </div>
              ),
            )}
          </div>

          {/* Encryption Type */}
          <h2 className="text-sm font-semibold text-text-muted tracking-wide mb-2">
            Encryption Type
          </h2>
          <div className="border border-border rounded-lg overflow-hidden shrink-0">
            {Object.entries(CRYPTO_CATEGORY_GROUP).map(
              ([cryptoCategory, cryptoCategoryLabel], i) => (
                <div key={cryptoCategory}>
                  <div
                    className={twMerge(
                      'px-4 py-2 bg-surface-alt text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border',
                      i !== 0 && 'border-t',
                    )}
                  >
                    {cryptoCategoryLabel}
                  </div>
                  {Object.entries(CRYPTO_METHODS)
                    .filter(([, m]) => m.category === cryptoCategory)
                    .map(([methodId, methodObject]) => (
                      <ListItem
                        key={methodId}
                        before={
                          methodId === method ? (
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
                        after={<KeyTypeChip value={methodObject.type} />}
                        onClick={() => setValue('method', methodId)}
                      >
                        <h3 className="font-medium text-sm text-text mb-1">
                          {methodObject.name}
                        </h3>
                        <p className="text-xs text-text-secondary">
                          {methodObject.description}
                        </p>
                      </ListItem>
                    ))}
                </div>
              ),
            )}
          </div>
        </PageBody>

        {/* Bottom Toolbar */}
        <PageToolbar className="p-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Icon icon={Loading03Icon} className="animate-spin" />
            )}
            Generate Key
          </Button>
        </PageToolbar>
      </form>
    </Page>
  );
};
