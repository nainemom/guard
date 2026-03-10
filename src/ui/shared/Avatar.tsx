import { botttsNeutral } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { type FC, useMemo } from 'react';

export const Avatar: FC<{
  size: number;
  seed: string;
}> = ({ size, seed }) => {
  const avatar = useMemo(() => {
    return createAvatar(botttsNeutral, {
      seed,
      size,
    }).toDataUri();
  }, [size, seed]);
  return (
    <img
      src={avatar}
      alt={seed}
      width={size}
      height={size}
      className="rounded-full overflow-hidden bg-surface-alt"
    />
  );
};
