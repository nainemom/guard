import { CheckCircleIcon, CopyIcon } from '@phosphor-icons/react';
import {
  type ButtonHTMLAttributes,
  type FC,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Button } from './Button';

export const CopyButton: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
    variant?: 'primary' | 'success' | 'error' | 'ghost' | 'outline';
    iconOnly?: boolean;
    children?: ReactNode;
  }
> = ({ value, children, onClick, ...props }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleClick = useCallback<
    NonNullable<ButtonHTMLAttributes<HTMLButtonElement>['onClick']>
  >(
    (e) => {
      clearTimeout(timerRef.current);
      navigator.clipboard.writeText(value);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 1000);
      onClick?.(e);
    },
    [value, onClick],
  );

  return (
    <Button {...props} onClick={handleClick}>
      {copied ? (
        <CheckCircleIcon size={18} className="text-success" />
      ) : (
        (children ?? <CopyIcon size={18} />)
      )}
    </Button>
  );
};
