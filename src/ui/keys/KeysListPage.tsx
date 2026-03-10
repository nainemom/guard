import {
  ArrowRight01Icon,
  DatabaseExportIcon,
  DatabaseImportIcon,
  Key01Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { type FC, useCallback, useMemo, useRef } from 'react';
import { Link } from 'wouter';
import { parseKey } from '@/crypto';
import { db, exportBackup, importBackup } from '@/db';
import {
  Avatar,
  Button,
  Icon,
  ListItem,
  LoadingSpinner,
  Menu,
  Page,
  PageBody,
  PageHeader,
} from '../shared';
import { KeyTypeChip } from './KeyTypeChip';

export const KeysListPage: FC = () => {
  const keys = useLiveQuery(() => db.keys.toArray())?.sort(
    (a, b) => a.createdAt - b.createdAt,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = useCallback(async () => {
    const blob = await exportBackup();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guard-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleRestore = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      try {
        await importBackup(file);
      } catch {
        // Invalid or incompatible backup file
      }
    },
    [],
  );

  return (
    <Page>
      {/* Navbar */}
      <PageHeader
        title="Guard"
        subtitle="List of your keys"
        after={
          <>
            <Menu
              items={useMemo(
                () => [
                  {
                    label: 'Backup keys',
                    icon: <Icon icon={DatabaseExportIcon} size={18} />,
                    onClick: handleBackup,
                    disabled: !keys || keys.length === 0,
                  },
                  {
                    label: 'Restore backup',
                    icon: <Icon icon={DatabaseImportIcon} size={18} />,
                    onClick: () => fileInputRef.current?.click(),
                  },
                ],
                [handleBackup, keys],
              )}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleRestore}
            />
          </>
        }
      />

      {/* Content */}
      <PageBody>
        {!keys ? (
          <LoadingSpinner />
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6 pb-16 max-w-96 mx-auto text-center">
            <div className="rounded-full bg-border-light p-5 mb-4">
              <Icon icon={Key01Icon} className="text-text-muted" size={40} />
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
              const parsed = parseKey(key.value);
              return (
                <Link key={key.id} to={`/keys/${key.id}`} className="contents">
                  <ListItem
                    before={<Avatar size={48} seed={key.name} />}
                    after={
                      <>
                        <KeyTypeChip
                          value={
                            parsed.method.type === 'asymmetric'
                              ? parsed.type === 'public'
                                ? 'lock'
                                : 'key+lock'
                              : 'key'
                          }
                        />
                        <Icon
                          icon={ArrowRight01Icon}
                          className="text-text-muted"
                          size={20}
                        />
                      </>
                    }
                  >
                    <p className="font-medium truncate text-text">{key.name}</p>
                    <p className="text-sm text-text-secondary">
                      {parsed.method.name}
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
          <Icon icon={PlusSignIcon} size={24} />
        </Button>
      </Link>
    </Page>
  );
};
