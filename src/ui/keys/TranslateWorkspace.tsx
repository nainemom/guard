import {
  ArrowDown02Icon,
  ArrowUp02Icon,
  Download04Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { type FC, useCallback, useRef } from 'react';
import { METHODS as CODEC_METHODS } from '@/codec';
import type { parseKey } from '@/crypto';
import type { Key } from '@/db';
import { Button, Chip, Icon, shareIcon, useShare } from '../shared';
import { Panel } from './Panel';
import { type PanelState, useEncrypt } from './useEncryptChat';

export const TranslateWorkspace: FC<{
  keyRecord: Key;
  parsed: ReturnType<typeof parseKey>;
}> = ({ keyRecord, parsed }) => {
  const { share } = useShare();
  const enc = useEncrypt(keyRecord);
  const plainFileRef = useRef<HTMLInputElement>(null);
  const cipherFileRef = useRef<HTMLInputElement>(null);

  const handleSharePanel = useCallback(
    async (panel: PanelState) => {
      if (panel.file) {
        const buf = await panel.file.arrayBuffer();
        share({
          file: new Uint8Array(buf),
          fileName: panel.file.name,
        });
      } else if (panel.text) {
        share({ text: panel.text });
      }
    },
    [share],
  );

  const methodName = parsed.method.name;
  const codecName =
    CODEC_METHODS[keyRecord.codec as keyof typeof CODEC_METHODS]?.name ??
    keyRecord.codec;

  const plainHasOutput =
    !!(enc.plain.text || enc.plain.file) && !enc.plain.error;
  const cipherHasOutput =
    !!(enc.cipher.text || enc.cipher.file) && !enc.cipher.error;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Hidden file inputs */}
      <input
        ref={plainFileRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) enc.setPlainFile(f);
          e.target.value = '';
        }}
      />
      <input
        ref={cipherFileRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) enc.setCipherFile(f);
          e.target.value = '';
        }}
      />

      {/* Top panel: Plaintext */}
      <Panel
        label="Plain"
        state={enc.plain}
        placeholder="Type or paste plaintext..."
        onTextChange={enc.setPlainText}
        onFileChange={enc.setPlainFile}
        onFilePick={() => plainFileRef.current?.click()}
        onClear={enc.clearPlain}
        shareAction={
          plainHasOutput
            ? {
                label: enc.plain.file ? 'Save' : 'Copy',
                icon: enc.plain.file ? Download04Icon : shareIcon,
                onClick: () => handleSharePanel(enc.plain),
              }
            : undefined
        }
      />

      {/* Action bar */}
      <div className="flex items-center gap-2 p-3 border-y border-border bg-surface-alt/50 shrink-0">
        <div className="w-0 flex-1 flex justify-start">
          {enc.canDecrypt && (
            <Button
              variant="outline"
              size="base"
              disabled={!enc.hasCipherInput || enc.isProcessing}
              onClick={enc.doDecrypt}
            >
              {enc.isProcessing ? (
                <Icon icon={Loading03Icon} size="sm" className="animate-spin" />
              ) : (
                <Icon icon={ArrowUp02Icon} size="sm" />
              )}
              Decrypt
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Chip>{methodName}</Chip>
          <Chip>{codecName}</Chip>
        </div>
        <div className="w-0 flex-1 flex justify-end">
          <Button
            size="base"
            disabled={!enc.hasPlainInput || enc.isProcessing}
            onClick={enc.doEncrypt}
          >
            Encrypt
            {enc.isProcessing ? (
              <Icon icon={Loading03Icon} size="sm" className="animate-spin" />
            ) : (
              <Icon icon={ArrowDown02Icon} size="sm" />
            )}
          </Button>
        </div>
      </div>

      {/* Bottom panel: Ciphertext */}
      <Panel
        label="Cipher"
        state={enc.cipher}
        placeholder="Paste ciphertext or attach encrypted file..."
        onTextChange={enc.setCipherText}
        onFileChange={enc.setCipherFile}
        onFilePick={() => cipherFileRef.current?.click()}
        onClear={enc.clearCipher}
        shareAction={
          cipherHasOutput
            ? {
                label: enc.cipher.file ? 'Save' : 'Copy',
                icon: enc.cipher.file ? Download04Icon : shareIcon,
                onClick: () => handleSharePanel(enc.cipher),
              }
            : undefined
        }
      />
    </div>
  );
};
