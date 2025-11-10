import { Github, Mail } from "lucide-react";
import {
  FormEvent,
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

export function RegisterPage(): JSX.Element {
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
    }, 1400);
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        description="Join the community to leave reviews, bookmark finds, and get personalised picks."
        footer={
          <AuthFooterLink
            prompt="Already have an account?"
            actionLabel="Sign in"
            to="/login"
          />
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Jamie Doe"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              required
              disabled={isLoading}
            />
          </div>

          <label
            htmlFor="terms"
            className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground"
          >
            <Checkbox id="terms" className="mt-0.5" disabled={isLoading} />
            <span>
              I agree to the{" "}
              <button
                type="button"
                className="font-medium text-primary transition-colors hover:text-primary/80"
                disabled={isLoading}
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                className="font-medium text-primary transition-colors hover:text-primary/80"
                disabled={isLoading}
              >
                Privacy Policy
              </button>
              .
            </span>
          </label>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="size-4" />
                <span>Creating account…</span>
              </span>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <div className="space-y-4">
          <AuthDivider label="or sign up with" />
          <AuthSocialButtons providers={socialProviders} disabled={isLoading} />
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
