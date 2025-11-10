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
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
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

export function RegisterPage(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInteractingRef = useRef(false);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const glowX = useMotionValue(55);
  const glowY = useMotionValue(35);
  const sparkOpacity = useMotionValue(0.4);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.8 };
  const rotateX = useSpring(tiltX, springConfig);
  const rotateY = useSpring(tiltY, springConfig);
  const glowOpacity = useSpring(sparkOpacity, { stiffness: 120, damping: 20 });

  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [autoFloatCycle, setAutoFloatCycle] = useState(0);

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
    if (!isCoarsePointer || isInteractingRef.current) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    let startTime: number | null = null;

    const animate = (time: number) => {
      if (startTime === null) {
        startTime = time;
      }

      const progress = (time - startTime) / 1000;

      tiltX.set(Math.sin(progress * 1.1) * 3.5);
      tiltY.set(Math.cos(progress * 0.9) * 3.5);
      glowX.set(55 + Math.sin(progress * 0.7) * 9);
      glowY.set(40 + Math.cos(progress * 0.85) * 9);
      sparkOpacity.set(0.45 + Math.sin(progress * 1.2) * 0.12);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isCoarsePointer, autoFloatCycle, glowX, glowY, sparkOpacity, tiltX, tiltY]);

  const cardShadow = useTransform([rotateX, rotateY], ([x, y]) => {
    const nextX = typeof x === "number" ? x : 0;
    const nextY = typeof y === "number" ? y : 0;
    return `0px ${Math.max(14 - nextX, 8)}px ${
      36 + Math.abs(nextY) * 2
    }px rgba(15, 23, 42, 0.25)`;
  });
  const glowBackground = useMotionTemplate`radial-gradient(120% 140% at ${glowX}% ${glowY}%, rgba(236, 72, 153, ${glowOpacity}), rgba(59, 130, 246, 0.18), transparent 70%)`;

  const handleCardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!cardContainerRef.current) {
      return;
    }
    isInteractingRef.current = true;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
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
    isInteractingRef.current = false;
    tiltX.set(0);
    tiltY.set(0);
    glowX.set(55);
    glowY.set(35);
    sparkOpacity.set(0.4);
    if (isCoarsePointer) {
      setAutoFloatCycle((cycle) => cycle + 1);
    }
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
            className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 0.75, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.18 }}
            style={{
              background:
                "radial-gradient(90% 95% at 15% 12%, rgba(236, 72, 153, 0.35), transparent 60%), radial-gradient(100% 110% at 85% 90%, rgba(59, 130, 246, 0.3), transparent 70%)",
            }}
          />

          <motion.div
            ref={cardContainerRef}
            className="relative"
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileTap={{ scale: 0.995 }}
            onPointerMove={handleCardPointerMove}
            onPointerEnter={() => {
              isInteractingRef.current = true;
              if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
              }
              sparkOpacity.set(0.6);
            }}
            onPointerUp={resetCardTilt}
            onPointerLeave={resetCardTilt}
            style={{
              rotateX,
              rotateY,
              transformPerspective: 1200,
              boxShadow: cardShadow,
            }}
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-60 blur-2xl"
              style={{ background: glowBackground }}
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
                  className="space-y-2 rounded-xl border border-border/50 bg-background/60 p-4 shadow-inner shadow-primary/5 backdrop-blur-sm transition"
                  variants={{
                    hidden: { opacity: 0, y: 26 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ borderColor: "rgba(236, 72, 153, 0.45)" }}
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
                  />
                </motion.div>

                <motion.div
                  className="space-y-2 rounded-xl border border-border/50 bg-background/60 p-4 shadow-inner shadow-primary/5 backdrop-blur-sm transition"
                  variants={{
                    hidden: { opacity: 0, y: 26 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ borderColor: "rgba(37, 99, 235, 0.4)" }}
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
                  />
                </motion.div>

                <motion.div
                  className="space-y-2 rounded-xl border border-border/50 bg-background/60 p-4 shadow-inner shadow-primary/5 backdrop-blur-sm transition"
                  variants={{
                    hidden: { opacity: 0, y: 26 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ borderColor: "rgba(59, 130, 246, 0.4)" }}
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
                  />
                </motion.div>

                <motion.div
                  className="space-y-2 rounded-xl border border-border/50 bg-background/60 p-4 shadow-inner shadow-primary/5 backdrop-blur-sm transition"
                  variants={{
                    hidden: { opacity: 0, y: 26 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ borderColor: "rgba(59, 130, 246, 0.4)" }}
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
