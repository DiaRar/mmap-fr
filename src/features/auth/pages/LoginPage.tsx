import { Github, Mail } from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  AuthCard,
  AuthDivider,
  AuthFooterLink,
  AuthLayout,
  AuthSocialButtons,
} from "../components";

export function LoginPage(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current);
      }
    },
    []
  );

  const socialProviders = useMemo(
    () => [
      {
        id: "github",
        label: "GitHub",
        icon: Github,
      },
      {
        id: "email-link",
        label: "Email link",
        icon: Mail,
      },
    ],
    []
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    pendingTimeout.current = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to pick up where you left off and keep tracking your favourite spots."
        footer={
          <AuthFooterLink
            prompt="Don’t have an account?"
            actionLabel="Create one"
            to="/register"
          />
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="remember"
              className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
            >
              <Checkbox id="remember" disabled={isLoading} />
              <span>Keep me signed in</span>
            </label>
            <button
              type="button"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80 disabled:pointer-events-none disabled:opacity-50"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="size-4" />
                <span>Signing in…</span>
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="space-y-4">
          <AuthDivider />
          <AuthSocialButtons providers={socialProviders} disabled={isLoading} />
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
