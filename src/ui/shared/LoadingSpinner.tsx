import { Loading03Icon } from '@hugeicons/core-free-icons';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { Icon } from './Icon';

export const LoadingSpinner: FC<{
  size?: number;
  className?: string;
}> = ({ size = 36, className }) => (
  <div className={clsx('flex items-center justify-center flex-1', className)}>
    <Icon
      icon={Loading03Icon}
      className="animate-spin text-text-muted"
      size={size}
    />
  </div>
);
