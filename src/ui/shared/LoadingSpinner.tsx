import { Loading03Icon } from '@hugeicons/core-free-icons';
import type { FC } from 'react';
import { tv } from 'tailwind-variants';
import { Icon } from './Icon';

const spinner = tv({
  base: 'flex items-center justify-center flex-1',
});

export const LoadingSpinner: FC<{
  className?: string;
}> = ({ className }) => (
  <div className={spinner({ className })}>
    <Icon
      icon={Loading03Icon}
      className="animate-spin text-text-muted"
      size="xl"
    />
  </div>
);
