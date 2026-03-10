import type { ComponentProps, FC } from 'react';
import type { MethodHandler } from '@/crypto';
import { Chip } from '../shared';

export const MethodTypeChip: FC<
  Omit<ComponentProps<typeof Chip>, 'children'> & {
    value: MethodHandler['type'];
  }
> = ({ value, ...props }) => (
  <Chip {...props}>{value === 'asymmetric' ? 'Asymmetric' : 'Symmetric'}</Chip>
);
