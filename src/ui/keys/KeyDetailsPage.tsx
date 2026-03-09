import { GearSix, Key, Lock, SpinnerGap } from '@phosphor-icons/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { type FC, useEffect, useRef, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { METHODS as CODEC_METHODS, decode, encode } from '@/codec';
import { decrypt, encrypt, getPublicKey, parseKey } from '@/crypto';
import { db } from '@/db';
import {
  Avatar,
  Button,
  ChatBubble,
  Chip,
  Input,
  LoadingSpinner,
  Page,
  PageBody,
  PageHeader,
  PageToolbar,
  useShare,
} from '@/ui/shared';
import { KeyTypeChip } from './KeyTypeChip';
import { MethodTypeChip } from './MethodTypeChip';

const codecEntries = Object.entries(CODEC_METHODS) as [
  keyof typeof CODEC_METHODS,
  (typeof CODEC_METHODS)[keyof typeof CODEC_METHODS],
][];

interface Message {
  id: string;
  operation: 'encrypt' | 'decrypt';
  codec: keyof typeof CODEC_METHODS;
  input: string;
  status: 'processing' | 'done' | 'error';
  outputType?: 'string' | 'file';
  output?: string;
  outputBytes?: Uint8Array;
  error?: string;
}

export const KeyDetailsPage: FC = () => {
  const [, params] = useRoute('/keys/:id');
  const [, navigate] = useLocation();
  const keyId = params?.id;
  const key = useLiveQuery(
    () => (keyId ? db.keys.get(keyId) : undefined),
    [keyId],
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [codec, setCodec] = useState<keyof typeof CODEC_METHODS>('base64');
  const [isProcessing, setIsProcessing] = useState(false);
  const { share, shareIcon } = useShare();

  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (!keyId) return null;

  if (key === undefined) {
    return (
      <Page>
        <PageHeader backTo="/keys" title="Key Details" />
        <LoadingSpinner />
      </Page>
    );
  }

  if (key === null) {
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

  const parsed = parseKey(key.value);
  const canDecrypt =
    parsed.method.type === 'symmetric' || parsed.type === 'private';

  const handleSubmit = async (operation: 'encrypt' | 'decrypt') => {
    if (!input.trim() || isProcessing) return;

    const msgId = crypto.randomUUID();
    const codecMethod = CODEC_METHODS[codec];
    const newMessage: Message = {
      id: msgId,
      operation,
      codec,
      input: input.trim(),
      status: 'processing',
      outputType: operation === 'decrypt' ? 'string' : codecMethod.output,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsProcessing(true);

    const delay = new Promise((r) => setTimeout(r, 300));

    try {
      let output: string;
      let outputBytes: Uint8Array | undefined;

      if (operation === 'encrypt') {
        const contentBytes = new TextEncoder().encode(newMessage.input);
        const encryptKey =
          parsed.method.type === 'asymmetric' && parsed.type === 'private'
            ? await getPublicKey(key.value)
            : key.value;
        const encrypted = await encrypt(contentBytes, encryptKey);
        const encoded = await encode(encrypted, codec);

        if (codecMethod.output === 'file') {
          outputBytes = encoded as unknown as Uint8Array;
          output = `${codecMethod.name} file (${outputBytes.length} bytes)`;
        } else {
          output = String(encoded);
        }
      } else {
        const decoded = await decode(newMessage.input, codec);
        const decrypted = await decrypt(decoded, key.value);
        output = new TextDecoder().decode(decrypted);
      }

      await delay;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, status: 'done' as const, output, outputBytes }
            : m,
        ),
      );
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                status: 'error' as const,
                error: e instanceof Error ? e.message : `${operation} failed`,
              }
            : m,
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Page>
      {/* Navbar */}
      <PageHeader
        backTo="/keys"
        title={key.name}
        before={<Avatar size={24} seed={key.name} />}
        after={
          <Button
            variant="ghost"
            iconOnly
            onClick={() => navigate(`/keys/${keyId}/edit`)}
          >
            <GearSix size={20} />
          </Button>
        }
      />

      {/* Message Feed */}
      <PageBody className="px-4 pb-4">
        {/* Key Info Card */}
        <div className="flex flex-col items-center gap-3 pt-6 pb-4">
          <Avatar size={64} seed={key.name} />
          <div className="text-lg font-semibold text-text">{key.name}</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Chip>{parsed.method.name}</Chip>
            <MethodTypeChip value={parsed.method.type} />
            <KeyTypeChip value={parsed.type} />
          </div>
        </div>

        {messages.length === 0 ? (
          <p className="text-center text-text-muted text-sm mt-8">
            Type a message below to encrypt or decrypt.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-1">
                {/* User input — right bubble */}
                <ChatBubble
                  position="end"
                  header={
                    <>
                      {msg.operation === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                      {' · '}
                      {CODEC_METHODS[msg.codec].name}
                    </>
                  }
                >
                  {msg.input}
                </ChatBubble>

                {/* Result — left bubble */}
                {msg.status === 'processing' ? (
                  <ChatBubble className="py-3">
                    <SpinnerGap
                      className="animate-spin text-text-muted"
                      size={20}
                    />
                  </ChatBubble>
                ) : msg.status === 'error' ? (
                  <ChatBubble variant="error" header="Error">
                    {msg.error}
                  </ChatBubble>
                ) : (
                  <ChatBubble
                    footer={
                      msg.output ? (
                        <Button
                          variant="ghost"
                          className="text-primary p-1 rounded"
                          onClick={() =>
                            share(
                              msg.outputType === 'file' && msg.outputBytes
                                ? {
                                    file: msg.outputBytes,
                                    fileName: `encrypted-${msg.id.slice(0, 8)}`,
                                  }
                                : { text: msg.output ?? '' },
                              msg.id,
                            )
                          }
                        >
                          {shareIcon(msg.id)}
                        </Button>
                      ) : undefined
                    }
                  >
                    <span className="text-text">{msg.output}</span>
                  </ChatBubble>
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={scrollAnchorRef} />
      </PageBody>

      {/* Bottom Input Bar */}
      <PageToolbar className="bg-surface">
        {/* Codec selector */}
        <div className="flex gap-1 overflow-x-auto px-4 pt-2">
          {codecEntries.map(([id, method]) => (
            <Button
              key={id}
              variant={codec === id ? 'primary' : 'outline'}
              onClick={() => setCodec(id)}
              className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
            >
              {method.name}
            </Button>
          ))}
        </div>

        {/* Input row */}
        <div className="flex items-start gap-2 p-3">
          <Input
            multiline
            autoGrow={120}
            rows={1}
            className="flex-1 rounded-xl"
            placeholder="Type your message..."
            value={input}
            onInput={(e) => setInput(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit('encrypt');
              }
            }}
          />
          {canDecrypt && (
            <Button
              iconOnly
              variant="success"
              disabled={!input.trim() || isProcessing}
              onClick={() => handleSubmit('decrypt')}
            >
              <Key size={20} />
            </Button>
          )}
          <Button
            iconOnly
            disabled={!input.trim() || isProcessing}
            onClick={() => handleSubmit('encrypt')}
          >
            <Lock size={20} />
          </Button>
        </div>
      </PageToolbar>
    </Page>
  );
};
