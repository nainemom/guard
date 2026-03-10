import { LockKeyIcon, SquareLock01Icon } from '@hugeicons/core-free-icons';
import type { ComponentProps, FC } from 'react';
import { Chip, Icon } from '../shared';

export const KeyTypeChip: FC<
  Omit<ComponentProps<typeof Chip>, 'children'> & {
    value: 'key' | 'key+lock' | 'lock';
  }
> = ({ value, ...props }) => (
  <Chip {...props}>
    {value === 'lock' && <Icon icon={SquareLock01Icon} size={16} />}
    {value === 'key+lock' && (
      <>
        <Icon icon={LockKeyIcon} size={16} />
        <span>{'+'}</span>
        <Icon icon={SquareLock01Icon} size={16} />
      </>
    )}
    {value === 'key' && <Icon icon={LockKeyIcon} size={16} />}
  </Chip>
);
