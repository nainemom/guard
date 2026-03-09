import { KeyIcon, LockIcon } from '@phosphor-icons/react';
import type { ComponentProps, FC } from 'react';
import type { KeyType } from '@/crypto';
import { Chip } from '../shared/Chip';

export const KeyTypeChip: FC<
  Omit<ComponentProps<typeof Chip>, 'children'> & {
    value: KeyType;
  }
> = ({ value, ...props }) => (
  <Chip {...props}>
    {value === 'private' && (
      <>
        <KeyIcon size={14} />
        {'/'}
      </>
    )}
    <LockIcon size={14} />
  </Chip>
);
