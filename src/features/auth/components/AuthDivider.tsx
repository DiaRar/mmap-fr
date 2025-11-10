import type { JSX } from 'react';

import { cn } from '@/lib/utils';

type AuthDividerProps = {
  label?: string;
  className?: string;
};

export function AuthDivider({
  label = 'or continue with',
  className,
}: AuthDividerProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground',
        className
      )}
    >
      <span className="h-px flex-1 bg-border" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
