import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type AuthSocialButton = {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
};

type AuthSocialButtonsProps = {
  providers: AuthSocialButton[];
  disabled?: boolean;
  className?: string;
};

export function AuthSocialButtons({
  providers,
  disabled,
  className,
}: AuthSocialButtonsProps): JSX.Element {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        className
      )}
    >
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className="flex w-full items-center justify-center gap-2"
          onClick={provider.onClick}
          disabled={disabled}
        >
          <provider.icon className="size-4" />
          <span className="text-sm font-medium">{provider.label}</span>
        </Button>
      ))}
    </div>
  );
}
