import type { JSX, ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AuthCardProps = {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AuthCard({
  title,
  description,
  footer,
  children,
  className,
}: AuthCardProps): JSX.Element {
  return (
    <Card
      className={cn(
        'overflow-hidden border-border/60 shadow-lg shadow-primary/5 backdrop-blur-sm',
        className
      )}
    >
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-balance text-sm text-muted-foreground">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
      {footer ? (
        <CardFooter className="flex justify-center border-t border-border/70 bg-muted/30 px-6 py-4 text-center text-sm">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
