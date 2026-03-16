import type { FC, HTMLAttributes } from 'react';
import { tv } from 'tailwind-variants';

const buttonGroup = tv({
  base: 'inline-flex gap-3 overflow-x-auto',
  variants: {
    contained: {
      true: 'rounded-lg bg-surface-alt p-1',
    },
  },
});

export const ButtonGroup: FC<
  HTMLAttributes<HTMLDivElement> & {
    contained?: boolean;
  }
> = ({ contained, className, ...props }) => (
  <div {...props} className={buttonGroup({ contained, className })} />
);
