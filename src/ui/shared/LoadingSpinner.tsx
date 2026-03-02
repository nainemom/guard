import { SpinnerGap } from '@phosphor-icons/react';
import type { FC } from 'react';

export const LoadingSpinner: FC<{
  size?: number;
  className?: string;
}> = ({ size = 36, className }) => (
  <div className={`flex items-center justify-center flex-1 ${className ?? ''}`}>
    <SpinnerGap className="animate-spin text-text-muted" size={size} />
  </div>
);
