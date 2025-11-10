import type { JSX } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

type AuthFooterLinkProps = {
  prompt: string;
  actionLabel: string;
  to: string;
  className?: string;
};

export function AuthFooterLink({
  prompt,
  actionLabel,
  to,
  className,
}: AuthFooterLinkProps): JSX.Element {
  return (
    <p
      className={cn(
        "text-center text-sm text-muted-foreground",
        className
      )}
    >
      {prompt}{" "}
      <Link
        to={to}
        className="font-medium text-primary transition-colors hover:text-primary/80"
      >
        {actionLabel}
      </Link>
    </p>
  );
}
