import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import type { FC, ReactNode } from 'react';
import { Link } from 'wouter';
import { Button } from './Button';
import { Icon } from './Icon';

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
      <Link to={backTo} asChild>
        <Button iconOnly className="-ms-2" variant="ghost">
          <Icon icon={ArrowLeft01Icon} size="lg" />
        </Button>
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
