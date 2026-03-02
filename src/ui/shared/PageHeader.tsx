import { ArrowLeft } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import type { FC, ReactNode } from 'react';
import { Link } from 'wouter';

interface HeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  before?: ReactNode;
  after?: ReactNode;
}

export const PageHeader: FC<HeaderProps> = ({
  title,
  subtitle,
  backTo,
  before,
  after,
}) => (
  <header className="flex items-center gap-3 px-4 border-b border-border shrink-0 h-14">
    {backTo && (
      <Link
        to={backTo}
        className={clsx(
          '-ms-2 size-10 flex items-center justify-center rounded-full',
          'transition-colors text-text-secondary bg-surface hover:bg-surface-alt focus-within:bg-surface-alt active:bg-surface',
        )}
      >
        <ArrowLeft size={24} />
      </Link>
    )}
    {before}
    <h1 className="text-lg font-semibold text-text truncate">{title}</h1>
    {subtitle && (
      <span className="text-sm text-text-secondary">{subtitle}</span>
    )}
    {after && (
      <div className="flex items-center gap-1 ms-auto shrink-0 -me-2">
        {after}
      </div>
    )}
  </header>
);
