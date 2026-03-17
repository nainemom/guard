import { LockKeyIcon, SquareLock01Icon } from '@hugeicons/core-free-icons';
import type { ComponentProps, FC } from 'react';
import { Chip, Icon } from '../shared';

export const KeyTypeChip: FC<
  Omit<ComponentProps<typeof Chip>, 'children'> & {
    value: 'asymmetric' | 'symmetric' | 'asymmetric-public';
  }
> = ({ value, ...props }) => (
  <Chip {...props}>
    {value === 'asymmetric-public' && (
      <Icon icon={SquareLock01Icon} size="sm" />
    )}
    {value === 'asymmetric' && (
      <>
        <Icon icon={LockKeyIcon} size="sm" />
        <span>{'+'}</span>
        <Icon icon={SquareLock01Icon} size="sm" />
      </>
    )}
    {value === 'symmetric' && <Icon icon={LockKeyIcon} size="sm" />}
  </Chip>
);
