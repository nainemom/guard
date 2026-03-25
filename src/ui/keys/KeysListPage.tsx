import {
  ArrowRight01Icon,
  CloudIcon,
  Key01Icon,
  Loading03Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { type FC, useCallback, useMemo } from 'react';
import { Link } from 'wouter';
import { METHODS as CODEC_METHODS } from '@/codec';
import { METHODS as CRYPTO_METHODS } from '@/crypto';
import { db, parseKeyValue } from '@/db';
import {
  Avatar,
  Button,
  Chip,
  Icon,
  ListItem,
  Page,
  PageBody,
  PageHeader,
  useToast,
} from '../shared';
import { KeyTypeChip } from './KeyTypeChip';

const FAKE_SYNCING_STATE = false;

export const KeysListPage: FC = () => {
  const keys = useLiveQuery(
    () =>
      db.keys.toArray().then((rows) => rows.filter((row) => !row.isDeleted)),
    [],
  );

  const loading = keys === undefined;
  const sortedKeys = useMemo(
    () => [...(keys ?? [])].sort((a, b) => b.updatedAt - a.updatedAt),
    [keys],
  );
  // const { sync, syncing, hasLocalChanges } = useSync();
  const toast = useToast();

  const handleSync = useCallback(async () => {
    try {
      // await sync();
      toast.show('Synced with Google Drive');
    } catch {
      toast.show('Sync failed');
    }
  }, [/*sync,*/ toast]);

  return (
    <Page>
      <PageHeader
        title="Guard"
        after={
          <Button
            variant="ghost"
            iconOnly
            disabled={FAKE_SYNCING_STATE}
            onClick={handleSync}
            className="relative"
          >
            {FAKE_SYNCING_STATE ? (
              <Icon icon={Loading03Icon} className="animate-spin" size="lg" />
            ) : (
              <Icon icon={CloudIcon} size="lg" />
            )}
            {/* {hasLocalChanges && !syncing && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
            )} */}
          </Button>
        }
      />

      <PageBody>
        {!loading && sortedKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6 pb-16 max-w-96 mx-auto text-center">
            <div className="rounded-full bg-border-light p-5 mb-4">
              <Icon icon={Key01Icon} className="text-text-muted" size="xl" />
            </div>
            <p className="text-text font-medium text-lg">
              You don't have any keys yet
            </p>
            <p className="text-text-muted text-sm mt-1">
              Create your first key by tapping the + button below to get started
              with encryption
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-light">
            {sortedKeys.map((key) => {
              const parsed = parseKeyValue(key.value);
              const keyPath = `/keys/${key.value}`;
              return (
                <Link key={key.value} to={keyPath} asChild>
                  <ListItem
                    before={<Avatar size={48} seed={key.name} />}
                    after={
                      <>
                        <KeyTypeChip
                          value={
                            CRYPTO_METHODS[parsed.method].type === 'asymmetric'
                              ? parsed.type === 'public'
                                ? 'asymmetric-public'
                                : 'asymmetric'
                              : 'symmetric'
                          }
                        />
                        <Icon
                          icon={ArrowRight01Icon}
                          className="text-text-muted"
                        />
                      </>
                    }
                  >
                    <p className="font-medium truncate text-text">{key.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Chip>{CRYPTO_METHODS[parsed.method].name}</Chip>
                      <Chip>{CODEC_METHODS[parsed.codec].name}</Chip>
                    </div>
                  </ListItem>
                </Link>
              );
            })}
          </div>
        )}
      </PageBody>

      <Link to="/keys/new" asChild>
        <Button
          iconOnly
          size="lg"
          className="fixed bottom-6 right-6 shadow-lg rounded-full"
        >
          <Icon icon={PlusSignIcon} size="lg" />
        </Button>
      </Link>
    </Page>
  );
};
