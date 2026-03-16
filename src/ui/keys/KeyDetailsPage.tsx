import {
  Alert01Icon,
  Attachment01Icon,
  Cancel01Icon,
  Delete01Icon,
  File01Icon,
  Key01Icon,
  MoreVerticalIcon,
  Share01Icon,
  SquareLock01Icon,
} from '@hugeicons/core-free-icons';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { METHODS as CODEC_METHODS } from '@/codec';
import { getPublicKey, parseKey } from '@/crypto';
import { db, type Key, useRow } from '@/db';
import {
  Button,
  ButtonGroup,
  Icon,
  Input,
  Page,
  PageBody,
  PageHeader,
  PageToolbar,
  Popover,
  shareIcon,
  useShare,
} from '../shared';
import { KeyInfoCard } from './KeyInfoCard';
import { type Result, useEncrypt } from './useEncryptChat';

const importUrl = (codec: string, keyStr: string) => {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/keys/new/${codec}/${encodeURIComponent(keyStr)}`;
};

const ResultCard: FC<{
  result: Result;
  codecName: string;
  onShare: () => void;
}> = ({ result, codecName, onShare }) => {
  const isEncrypt = result.operation === 'encrypt';

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Input */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 px-1">
          {result.inputType === 'file' ? 'Your file' : 'Your text'}
        </h3>
        <div className="rounded-xl border border-border p-3">
          {result.inputType === 'file' ? (
            <div className="flex items-center gap-2 text-text">
              <Icon
                icon={File01Icon}
                size="sm"
                className="text-text-muted shrink-0"
              />
              <span className="text-sm truncate">{result.inputLabel}</span>
            </div>
          ) : (
            <p
              dir="auto"
              className="text-sm wrap-anywhere text-text whitespace-pre-wrap line-clamp-3"
            >
              {result.inputLabel}
            </p>
          )}
        </div>
      </div>

      {/* Operation label */}
      <div className="flex items-center gap-2 px-1">
        <Icon
          icon={isEncrypt ? SquareLock01Icon : Key01Icon}
          size="sm"
          className="text-primary"
        />
        <span className="text-xs font-medium text-primary">
          {isEncrypt ? 'Encrypted' : 'Decrypted'} with {codecName}
        </span>
      </div>

      {/* Output */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 px-1">
          Result
        </h3>
        {result.error ? (
          <div className="rounded-xl border border-error/20 bg-error-light p-3 flex items-start gap-2">
            <Icon
              icon={Alert01Icon}
              size="sm"
              className="text-error shrink-0 mt-0.5"
            />
            <p className="text-sm text-error">{result.error}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex flex-col gap-2">
            <p
              dir="auto"
              className="text-sm wrap-anywhere select-all text-text whitespace-pre-wrap font-mono"
            >
              {result.output}
            </p>
            <div className="flex justify-end">
              <Button variant="ghost" iconOnly size="sm" onClick={onShare}>
                <Icon icon={shareIcon} size="sm" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const KeyDetailsPage: FC = () => {
  const [, params] = useRoute('/keys/:id');
  const [, navigate] = useLocation();
  const keyId = params?.id;
  const key = useRow('keys', keyId);

  const { share } = useShare();
  const [publicKey, setPublicKey] = useState<string>();

  useEffect(() => {
    if (!key) return;
    const parsed = parseKey(key.value);
    if (parsed.method.type === 'asymmetric') {
      getPublicKey(key.value).then(setPublicKey);
    }
  }, [key]);

  const handleDelete = useCallback(() => {
    if (!key || !keyId) return;
    if (!confirm(`Delete "${key.name}"? This cannot be undone.`)) return;
    db.remove('keys', keyId);
    navigate('/keys');
  }, [key, keyId, navigate]);

  const parsed = key ? parseKey(key.value) : null;
  const isAsymmetric = parsed?.method.type === 'asymmetric';
  const codec = key?.codec ?? 'base64';

  if (!keyId) return null;

  if (!key) {
    return (
      <Page>
        <PageHeader backTo="/keys" title="Key Details" />
        <div className="px-4">
          <p className="text-text-secondary text-center mt-12">
            Key not found.
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        backTo="/keys"
        title={key.name}
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
                {isAsymmetric && (
                  <button
                    type="button"
                    disabled={!publicKey}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text text-start transition-colors cursor-pointer hover:bg-surface-alt disabled:opacity-40 disabled:cursor-default"
                    onClick={() => {
                      close();
                      if (publicKey)
                        share({ text: importUrl(codec, publicKey) });
                    }}
                  >
                    <Icon icon={Share01Icon} className="shrink-0" />
                    <div className="flex flex-col">
                      <span>Share Lock</span>
                      <span className="text-xs text-text-muted">
                        Others can encrypt messages for you
                      </span>
                    </div>
                  </button>
                )}
                <button
                  type="button"
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text text-start transition-colors cursor-pointer hover:bg-surface-alt"
                  onClick={() => {
                    close();
                    share({ text: importUrl(codec, key.value) });
                  }}
                >
                  <Icon icon={Share01Icon} className="shrink-0" />
                  <div className="flex flex-col">
                    <span>Share Key</span>
                    <span className="text-xs text-text-muted">
                      Anyone with this can encrypt and decrypt
                    </span>
                  </div>
                </button>
                <div className="my-1 border-t border-border-light" />
                <button
                  type="button"
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-error text-start transition-colors cursor-pointer hover:bg-surface-alt"
                  onClick={() => {
                    close();
                    handleDelete();
                  }}
                >
                  <Icon icon={Delete01Icon} className="shrink-0" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </Popover>
        }
      />
      <KeyDetailsContent keyRecord={key} />
    </Page>
  );
};

const KeyDetailsContent: FC<{ keyRecord: Key }> = ({ keyRecord }) => {
  const { share } = useShare();
  const enc = useEncrypt(keyRecord);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const codecName =
    CODEC_METHODS[keyRecord.codec as keyof typeof CODEC_METHODS]?.name ??
    keyRecord.codec;

  const handleFilePick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) enc.attachFile(f);
      e.target.value = '';
    },
    [enc.attachFile],
  );

  return (
    <>
      <PageBody className="px-4 pb-4">
        <KeyInfoCard keyRecord={keyRecord} />

        {enc.result ? (
          <ResultCard
            result={enc.result}
            codecName={codecName}
            onShare={() =>
              enc.result?.output && share({ text: enc.result.output })
            }
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-muted text-sm">
              Enter text or attach a file to encrypt or decrypt
            </p>
          </div>
        )}
      </PageBody>

      <PageToolbar className="bg-surface">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-start gap-3 p-3">
          {enc.file ? (
            <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-surface-alt border border-border flex-1 min-w-0">
              <Icon
                icon={File01Icon}
                size="sm"
                className="text-text-muted shrink-0"
              />
              <span className="text-sm text-text truncate flex-1">
                {enc.file.name}
              </span>
              <button
                type="button"
                className="shrink-0 text-text-muted hover:text-text transition-colors cursor-pointer"
                onClick={() => enc.attachFile(null)}
              >
                <Icon icon={Cancel01Icon} size="sm" />
              </button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                iconOnly
                onClick={handleFilePick}
                className="shrink-0"
              >
                <Icon icon={Attachment01Icon} />
              </Button>
              <Input
                multiline
                autoGrow={120}
                rows={1}
                className="flex-1 rounded-xl"
                placeholder="Type your message..."
                value={enc.input}
                onInput={(e) => enc.setInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    enc.submit('encrypt');
                  }
                }}
              />
            </>
          )}
          <ButtonGroup>
            {enc.canDecrypt && !enc.file && (
              <Button
                iconOnly
                variant="success"
                disabled={!enc.hasInput || enc.isProcessing}
                onClick={() => enc.submit('decrypt')}
              >
                <Icon icon={Key01Icon} size="lg" />
              </Button>
            )}
            <Button
              iconOnly
              disabled={!enc.hasInput || enc.isProcessing}
              onClick={() => enc.submit('encrypt')}
            >
              <Icon icon={SquareLock01Icon} size="lg" />
            </Button>
          </ButtonGroup>
        </div>
      </PageToolbar>
    </>
  );
};
