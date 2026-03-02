import { CaretRight, Key, Plus } from '@phosphor-icons/react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { FC } from 'react';
import { Link } from 'wouter';
import { parseKey } from '@/crypto';
import { db } from '@/db';
import {
  Avatar,
  Button,
  ListItem,
  LoadingSpinner,
  Page,
  PageBody,
  PageHeader,
} from '@/ui/shared';
import { KeyTypeChip } from './KeyTypeChip';

export const KeysListPage: FC = () => {
  const keys = useLiveQuery(() => db.keys.toArray())?.sort(
    (a, b) => a.createdAt - b.createdAt,
  );

  return (
    <Page>
      {/* Navbar */}
      <PageHeader title="Guard" subtitle="List of your keys" />

      {/* Content */}
      <PageBody>
        {!keys ? (
          <LoadingSpinner />
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6 pb-16 max-w-96 mx-auto text-center">
            <div className="rounded-full bg-border-light p-5 mb-4">
              <Key className="text-text-muted" size={40} />
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
            {keys.map((key) => {
              const parsedKey = parseKey(key.value);
              return (
                <Link key={key.id} to={`/keys/${key.id}`} className="contents">
                  <ListItem
                    before={<Avatar size={48} seed={key.name} />}
                    after={
                      <>
                        <KeyTypeChip value={parsedKey.type} />
                        <CaretRight className="text-text-muted" size={20} />
                      </>
                    }
                  >
                    <p className="font-medium truncate text-text">{key.name}</p>
                    <p className="text-sm text-text-secondary">
                      {parsedKey.method.name}
                    </p>
                  </ListItem>
                </Link>
              );
            })}
          </div>
        )}
      </PageBody>

      {/* FAB */}
      <Link to="/keys/new" className="fixed bottom-6 right-6 contents">
        <Button iconOnly className="fixed bottom-6 right-6 size-14 shadow-lg">
          <Plus size={24} />
        </Button>
      </Link>
    </Page>
  );
};
