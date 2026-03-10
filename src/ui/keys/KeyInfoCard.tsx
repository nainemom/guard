import {
  Alert02Icon,
  Cancel01Icon,
  Edit02Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { type FC, useCallback, useRef, useState } from 'react';
import { parseKey } from '@/crypto';
import type { Key } from '@/db';
import { db } from '@/db';
import { Avatar, Button, Chip, Icon } from '../shared';
import { KeyTypeChip } from './KeyTypeChip';

export const KeyInfoCard: FC<{ keyRecord: Key }> = ({ keyRecord }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const parsed = parseKey(keyRecord.value);

  const startEdit = useCallback(() => {
    setDraft(keyRecord.name);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [keyRecord.name]);

  const save = useCallback(async () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== keyRecord.name) {
      await db.keys.update(keyRecord.id, { name: trimmed });
    }
    setEditing(false);
  }, [keyRecord.id, keyRecord.name, draft]);

  const displayName = editing ? draft : keyRecord.name;

  return (
    <div className="flex flex-col items-center gap-3 pt-6 pb-4">
      <Avatar size={64} seed={displayName} />
      {editing ? (
        <div className="flex items-center w-full max-w-64 border-b-2 border-primary py-1">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="text-lg font-semibold text-text text-start bg-transparent outline-none min-w-0 flex-1"
          />
          <Button
            variant="ghost"
            iconOnly
            onClick={() => setEditing(false)}
            className="size-7"
          >
            <Icon icon={Cancel01Icon} size={14} />
          </Button>
          <Button
            variant="ghost"
            iconOnly
            onClick={save}
            className="size-7 text-success"
          >
            <Icon icon={Tick01Icon} size={14} />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1 border-b-2 border-transparent py-1">
          <span className="text-lg font-semibold text-text">
            {keyRecord.name}
          </span>
          <Button
            variant="ghost"
            iconOnly
            onClick={startEdit}
            className="size-7"
          >
            <Icon icon={Edit02Icon} size={14} />
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
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
      <div className="flex items-center justify-center gap-1.5 text-text-muted mt-1">
        <Icon icon={Alert02Icon} size={14} className="shrink-0" />
        <p className="text-sm">
          Messages are not saved and will be lost on refresh.
        </p>
      </div>
    </div>
  );
};
