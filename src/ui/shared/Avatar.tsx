import { shapes } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { type FC, useMemo } from 'react';
import { tv } from 'tailwind-variants';

const avatar = tv({
  base: 'rounded-lg overflow-hidden bg-surface-alt',
});

export const Avatar: FC<{
  size: number;
  seed: string;
  className?: string;
}> = ({ size, seed, className }) => {
  const img = useMemo(() => {
    return createAvatar(shapes, {
      seed,
      size,
    }).toDataUri();
  }, [size, seed]);
  return (
    <img
      src={img}
      alt={seed}
      width={size}
      height={size}
      className={avatar({ className })}
    />
  );
};
