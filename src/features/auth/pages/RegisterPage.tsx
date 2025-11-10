import { Github, Mail } from "lucide-react";
import {
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Transition,
} from "motion/react";

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
} from "../components";
import { cn } from "@/lib/utils";

export function RegisterPage(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const glowX = useMotionValue(55);
  const glowY = useMotionValue(35);
  const sparkOpacity = useMotionValue(0.4);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.8 };
  const rotateX = useSpring(tiltX, springConfig);
  const rotateY = useSpring(tiltY, springConfig);
  const glowOpacity = useSpring(sparkOpacity, { stiffness: 120, damping: 20 });

  const prefersReducedMotion = useReducedMotion();
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const cardInView = useInView(cardContainerRef, { amount: 0.6 });

  const enableInteractiveTilt = !prefersReducedMotion && !isCoarsePointer;
  const enableAmbientLoop = !prefersReducedMotion && isCoarsePointer;
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: coarse) and (hover: none)");
    const handleChange = () => {
      setIsCoarsePointer(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!enableInteractiveTilt) {
      resetCardTilt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableInteractiveTilt]);

  const cardShadow = useTransform([rotateX, rotateY], ([x, y]) => {
    const nextX = typeof x === "number" ? x : 0;
    const nextY = typeof y === "number" ? y : 0;
    return `0px ${Math.max(14 - nextX, 8)}px ${
      36 + Math.abs(nextY) * 2
    }px rgba(15, 23, 42, 0.25)`;
  });
  const glowBackground = useMotionTemplate`radial-gradient(120% 140% at ${glowX}% ${glowY}%, rgba(236, 72, 153, ${glowOpacity}), rgba(59, 130, 246, 0.18), transparent 70%)`;
  const staticGlowBackground =
    "radial-gradient(120% 140% at 50% 38%, rgba(236, 72, 153, 0.45), rgba(59, 130, 246, 0.16), transparent 70%)";

  const ambientInitial = {
    opacity: 0,
    scale: enableInteractiveTilt ? 0.88 : enableAmbientLoop ? 0.95 : 0.97,
  };
  const ambientAnimate = enableInteractiveTilt
    ? { opacity: 0.75, scale: 1 }
    : enableAmbientLoop
      ? { opacity: [0.5, 0.68, 0.5], scale: [0.94, 1.02, 0.94] }
      : { opacity: 0.6, scale: 1 };
  const ambientTransition: Transition = enableInteractiveTilt
    ? { duration: 0.85, delay: 0.18, ease: "easeOut" }
    : enableAmbientLoop
      ? { duration: 9.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
      : { duration: 0.65, ease: "easeOut" };
  const ambientBlurClass = enableInteractiveTilt ? "blur-3xl" : "blur-2xl sm:blur-3xl";

  const cardInitial = {
    opacity: 0,
    y: enableInteractiveTilt ? 36 : enableAmbientLoop ? 22 : 20,
    scale: 0.97,
  };
  const cardAnimate = enableInteractiveTilt
    ? { opacity: 1, y: 0, scale: 1 }
    : enableAmbientLoop
      ? { opacity: 1, y: [0, -7, 0], scale: [1, 1.012, 1] }
      : { opacity: 1, y: 0, scale: 1 };
  const cardTransition: Transition = enableInteractiveTilt
    ? { duration: 0.65, ease: "easeOut" }
    : enableAmbientLoop
      ? { duration: 10.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
      : { duration: 0.65, ease: "easeOut" };
  const cardMotionStyle = enableInteractiveTilt
    ? { rotateX, rotateY, transformPerspective: 1200, boxShadow: cardShadow }
    : undefined;

  const glowInitial = {
    opacity: enableInteractiveTilt ? 0.65 : enableAmbientLoop ? 0.48 : 0.44,
    scale: 1,
  };
  const glowAnimate = enableInteractiveTilt
    ? undefined
    : enableAmbientLoop
      ? { opacity: [0.42, 0.58, 0.42], scale: [0.97, 1.05, 0.97] }
      : undefined;
  const glowTransition: Transition | undefined = enableInteractiveTilt
    ? undefined
    : enableAmbientLoop
      ? { duration: 10.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
      : undefined;
  const glowStyle = enableInteractiveTilt
    ? { background: glowBackground }
    : { background: staticGlowBackground };
  const showMobileAura = enableAmbientLoop;

  const fieldBaseClasses =
    "space-y-2 rounded-xl border border-border/50 bg-background/60 p-4 shadow-inner shadow-primary/5 backdrop-blur-sm transition-colors duration-200";
  const fieldFocusClasses: Record<string, string> = {
    "full-name":
      "border-rose-400/60 shadow-[0_0_0_1px_rgba(244,114,182,0.35)] shadow-rose-400/10",
    "register-email":
      "border-sky-400/55 shadow-[0_0_0_1px_rgba(56,189,248,0.35)] shadow-sky-400/10",
    "register-password":
      "border-indigo-400/55 shadow-[0_0_0_1px_rgba(99,102,241,0.3)] shadow-indigo-400/10",
    "confirm-password":
      "border-indigo-400/55 shadow-[0_0_0_1px_rgba(99,102,241,0.3)] shadow-indigo-400/10",
  };

  const handleFieldFocus = (fieldId: string) => {
    setFocusedField(fieldId);
  };

  const handleFieldBlur = (fieldId: string) => {
    setFocusedField((prev) => (prev === fieldId ? null : prev));
  };

  const handleCardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enableInteractiveTilt || !cardContainerRef.current || !cardInView) {
      return;
    }

    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -6;
    const rotateYValue = ((x - centerX) / centerX) * 6;

    tiltX.set(rotateXValue);
    tiltY.set(rotateYValue);
    glowX.set((x / rect.width) * 100);
    glowY.set((y / rect.height) * 100);
    sparkOpacity.set(0.7);
  };

  const resetCardTilt = () => {
    if (!enableInteractiveTilt) {
      return;
    }
    tiltX.set(0);
    tiltY.set(0);
    glowX.set(55);
    glowY.set(35);
    sparkOpacity.set(0.4);
  };

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
      <MotionConfig transition={{ type: "spring", stiffness: 170, damping: 18 }}>
        <div className="relative">
          <motion.div
            aria-hidden
            className={`pointer-events-none absolute inset-0 -z-10 ${ambientBlurClass}`}
            initial={ambientInitial}
            animate={ambientAnimate}
            transition={ambientTransition}
            style={{
              background:
                "radial-gradient(90% 95% at 15% 12%, rgba(236, 72, 153, 0.35), transparent 60%), radial-gradient(100% 110% at 85% 90%, rgba(59, 130, 246, 0.3), transparent 70%)",
            }}
          />

          <motion.div
            ref={cardContainerRef}
            className="relative rounded-xl"
            initial={cardInitial}
            animate={cardAnimate}
            transition={cardTransition}
            whileTap={{ scale: 0.995 }}
            onPointerMove={enableInteractiveTilt ? handleCardPointerMove : undefined}
            onPointerEnter={enableInteractiveTilt ? () => sparkOpacity.set(0.6) : undefined}
            onPointerUp={enableInteractiveTilt ? resetCardTilt : undefined}
            onPointerLeave={enableInteractiveTilt ? resetCardTilt : undefined}
            style={cardMotionStyle}
          >
            {showMobileAura ? (
              <div className="auth-card-aura-wrapper">
                <div className="auth-card-aura auth-card-aura--warm" />
              </div>
            ) : null}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-60 blur-2xl"
              initial={glowInitial}
              animate={glowAnimate}
              transition={glowTransition}
              style={glowStyle}
            />

            <AuthCard
              title="Create your account"
              description="Join the community to leave reviews, bookmark finds, and get personalised picks."
              footer={
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <AuthFooterLink
                    prompt="Already have an account?"
                    actionLabel="Sign in"
                    to="/login"
                  />
                </motion.div>
              }
              className="relative overflow-visible"
            >
              <motion.div
                aria-hidden
                className="absolute -right-10 top-6 hidden h-24 w-24 rounded-full border border-rose-400/40 bg-rose-400/10 blur-md sm:block"
                initial={{ opacity: 0, scale: 0.7, rotate: 12 }}
                animate={{ opacity: 0.55, scale: 1, rotate: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                style={{ backdropFilter: "blur(6px)" }}
              />

              <motion.form
                className="space-y-5"
                onSubmit={handleSubmit}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.08, delayChildren: 0.25 },
                  },
                }}
              >
                <motion.div
                  className={cn(
                    fieldBaseClasses,
                    focusedField === "full-name" && fieldFocusClasses["full-name"]
                  )}
                  variants={{
                    hidden: { opacity: 0, y: 26 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={
                    enableInteractiveTilt
                      ? { borderColor: "rgba(236, 72, 153, 0.45)" }
                      : undefined
                  }
                >
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Jamie Doe"
              required
              disabled={isLoading}
                    className="h-11 rounded-lg bg-background/70 text-base shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/50 md:text-sm"
                    onFocus={() => handleFieldFocus("full-name")}
                    onBlur={() => handleFieldBlur("full-name")}
            />
                </motion.div>

                <motion.div
                  className={cn(
                    fieldBaseClasses,
                    focusedField === "register-email" && fieldFocusClasses["register-email"]
                  )}
                  variants={{
                    hidden: { opacity: 0, y: 26 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={
                    enableInteractiveTilt
                      ? { borderColor: "rgba(37, 99, 235, 0.4)" }
                      : undefined
                  }
                >
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              disabled={isLoading}
                    className="h-11 rounded-lg bg-background/70 text-base shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/50 md:text-sm"
                    onFocus={() => handleFieldFocus("register-email")}
                    onBlur={() => handleFieldBlur("register-email")}
            />
                </motion.div>

                <motion.div
                  className={cn(
                    fieldBaseClasses,
                    focusedField === "register-password" &&
                      fieldFocusClasses["register-password"]
                  )}
                  variants={{
                    hidden: { opacity: 0, y: 26 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={
                    enableInteractiveTilt
                      ? { borderColor: "rgba(59, 130, 246, 0.4)" }
                      : undefined
                  }
                >
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              required
              disabled={isLoading}
                    className="h-11 rounded-lg bg-background/70 text-base shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/50 md:text-sm"
                    onFocus={() => handleFieldFocus("register-password")}
                    onBlur={() => handleFieldBlur("register-password")}
            />
                </motion.div>

                <motion.div
                  className={cn(
                    fieldBaseClasses,
                    focusedField === "confirm-password" &&
                      fieldFocusClasses["confirm-password"]
                  )}
                  variants={{
                    hidden: { opacity: 0, y: 26 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={
                    enableInteractiveTilt
                      ? { borderColor: "rgba(59, 130, 246, 0.4)" }
                      : undefined
                  }
                >
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              required
              disabled={isLoading}
                    className="h-11 rounded-lg bg-background/70 text-base shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/50 md:text-sm"
                    onFocus={() => handleFieldFocus("confirm-password")}
                    onBlur={() => handleFieldBlur("confirm-password")}
            />
                </motion.div>

                <motion.label
            htmlFor="terms"
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-muted-foreground transition"
                  variants={{
                    hidden: { opacity: 0, y: 22 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{
                    borderColor: "rgba(236, 72, 153, 0.4)",
                    backgroundColor: "rgba(236, 72, 153, 0.08)",
                  }}
                  whileTap={{ scale: 0.99 }}
          >
            <Checkbox id="terms" className="mt-0.5" disabled={isLoading} />
            <span>
              I agree to the{" "}
                    <motion.button
                type="button"
                      className="font-medium text-primary transition-colors hover:text-primary/80 disabled:pointer-events-none disabled:opacity-50"
                disabled={isLoading}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
              >
                Terms of Service
                    </motion.button>{" "}
              and{" "}
                    <motion.button
                type="button"
                      className="font-medium text-primary transition-colors hover:text-primary/80 disabled:pointer-events-none disabled:opacity-50"
                disabled={isLoading}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
              >
                Privacy Policy
                    </motion.button>
              .
            </span>
                </motion.label>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -1 }}
                >
                  <Button asChild className="w-full" disabled={isLoading}>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.01 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
                          <motion.span
                            key="loading"
                            className="flex items-center justify-center gap-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                          >
                            <motion.span
                              className="grid place-items-center"
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                ease: "linear",
                                duration: 1,
                              }}
                            >
                <Spinner className="size-4" />
                            </motion.span>
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              Creating account…
                            </motion.span>
                          </motion.span>
            ) : (
                          <motion.span
                            key="default"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.2 }}
                          >
                            Create account
                          </motion.span>
            )}
                      </AnimatePresence>
                    </motion.button>
          </Button>
                </motion.div>
              </motion.form>

              <motion.div
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { delayChildren: 0.45, staggerChildren: 0.1 },
                  },
                }}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
          <AuthDivider label="or sign up with" />
                </motion.div>
                <motion.div
                  className="grid gap-3 sm:grid-cols-2"
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { staggerChildren: 0.09 },
                    },
                  }}
                >
                  {socialProviders.map((provider, index) => (
                    <Button
                      key={provider.id}
                      variant="outline"
                      asChild
                      disabled={isLoading}
                      className="flex w-full items-center justify-center gap-2"
                    >
                      <motion.button
                        type="button"
                        variants={{
                          hidden: { opacity: 0, y: 18, scale: 0.95 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                              delay: index * 0.025,
                              type: "spring",
                              stiffness: 240,
                              damping: 20,
                            },
                          },
                        }}
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <provider.icon className="size-4" />
                        <span className="text-sm font-medium">
                          {provider.label}
                        </span>
                      </motion.button>
                    </Button>
                  ))}
                </motion.div>
              </motion.div>
            </AuthCard>
          </motion.div>
        </div>
      </MotionConfig>
    </AuthLayout>
  );
}
