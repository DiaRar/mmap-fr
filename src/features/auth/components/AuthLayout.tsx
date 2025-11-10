import type { JSX, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type AuthLayoutProps = PropsWithChildren<{
  className?: string;
}>;

export function AuthLayout({
  children,
  className,
}: AuthLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className={cn("w-full max-w-md space-y-6", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
