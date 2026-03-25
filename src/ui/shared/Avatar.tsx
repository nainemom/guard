import { initials } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { type FC, useMemo } from 'react';
import { tv } from 'tailwind-variants';

const avatar = tv({
  base: 'rounded-lg overflow-hidden bg-surface-alt',
  variants: {
    gray: {
      true: 'grayscale-100',
      false: '',
    },
  },
});

export const Avatar: FC<{
  size: number;
  seed: string;
  className?: string;
  gray?: boolean;
}> = ({ size, seed, className, gray }) => {
  const img = useMemo(() => {
    return createAvatar(initials, {
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
      style={{ width: size, height: size }}
      className={avatar({ className, gray })}
    />
  );
};
