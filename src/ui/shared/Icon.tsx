import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react';
import type { FC } from 'react';

const SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 40,
} as const;

export const Icon: FC<
  Omit<HugeiconsIconProps, 'size'> & {
    size?: keyof typeof SIZES;
  }
> = ({ size = 'md', ...props }) => (
  <HugeiconsIcon {...props} size={SIZES[size]} />
);
