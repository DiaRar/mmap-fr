import { Github, Mail } from 'lucide-react';
import {
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from 'react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { AuthCard, AuthDivider, AuthFooterLink, AuthLayout } from '../components';

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInteractingRef = useRef(false);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(40);
  const sparkOpacity = useMotionValue(0.35);

  const springConfig = { stiffness: 140, damping: 18, mass: 0.7 };
  const rotateX = useSpring(tiltX, springConfig);
  const rotateY = useSpring(tiltY, springConfig);
  const glowOpacity = useSpring(sparkOpacity, { stiffness: 120, damping: 20 });

  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [autoFloatCycle, setAutoFloatCycle] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(pointer: coarse) and (hover: none)');
    const handleChange = () => {
      setIsCoarsePointer(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const goToHome = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    navigate('/', { replace: true });
  };

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

      tiltX.set(Math.sin(progress * 1.2) * 4);
      tiltY.set(Math.cos(progress) * 4);
      glowX.set(50 + Math.sin(progress * 0.8) * 8);
      glowY.set(45 + Math.cos(progress * 0.9) * 8);
      sparkOpacity.set(0.45 + Math.sin(progress * 1.4) * 0.12);

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
    const nextX = typeof x === 'number' ? x : 0;
    const nextY = typeof y === 'number' ? y : 0;
    return `0px ${Math.max(12 - nextX, 6)}px ${32 + Math.abs(nextY) * 2}px rgba(15, 23, 42, 0.25)`;
  });
  const glowBackground = useMotionTemplate`radial-gradient(120% 140% at ${glowX}% ${glowY}%, rgba(14, 165, 233, ${glowOpacity}), rgba(59, 130, 246, 0.15), transparent 70%)`;

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

    const rotateXValue = ((y - centerY) / centerY) * -7;
    const rotateYValue = ((x - centerX) / centerX) * 7;

    tiltX.set(rotateXValue);
    tiltY.set(rotateYValue);
    glowX.set((x / rect.width) * 100);
    glowY.set((y / rect.height) * 100);
    sparkOpacity.set(0.65);
  };

  const resetCardTilt = () => {
    isInteractingRef.current = false;
    tiltX.set(0);
    tiltY.set(0);
    glowX.set(50);
    glowY.set(40);
    sparkOpacity.set(0.35);
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
        id: 'github',
        label: 'GitHub',
        icon: Github,
      },
      {
        id: 'email-link',
        label: 'Email link',
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
      <MotionConfig transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
        <div className="relative">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            style={{
              background:
                'radial-gradient(90% 95% at 10% 10%, rgba(192, 132, 252, 0.35), transparent 60%), radial-gradient(90% 110% at 90% 90%, rgba(14, 165, 233, 0.35), transparent 70%)',
            }}
          />

          <motion.div
            ref={cardContainerRef}
            className="relative"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileTap={{ scale: 0.995 }}
            onPointerMove={handleCardPointerMove}
            onPointerEnter={() => {
              isInteractingRef.current = true;
              if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
              }
              sparkOpacity.set(0.55);
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
              title="Welcome back"
              description="Sign in to pick up where you left off and keep tracking your favourite spots."
              footer={
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <AuthFooterLink
                    prompt="Don’t have an account?"
                    actionLabel="Create one"
                    to="/register"
                  />
                </motion.div>
              }
              className="relative overflow-visible"
            >
              <motion.div
                className="absolute -left-6 top-0 hidden h-20 w-20 -translate-y-1/2 rounded-full border border-primary/40 bg-primary/10 blur-sm sm:block"
                aria-hidden
                initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                animate={{ opacity: 0.5, scale: 1, rotate: 0 }}
                style={{ backdropFilter: 'blur(4px)' }}
              />

              <motion.form
                className="space-y-5"
                onSubmit={handleSubmit}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
                  },
                }}
              >
                <motion.div
                  className="space-y-2 rounded-xl border border-border/50 bg-background/60 p-4 shadow-inner shadow-primary/5 backdrop-blur-sm transition"
                  variants={{
                    hidden: { opacity: 0, y: 22 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ borderColor: 'rgba(14, 165, 233, 0.4)' }}
                >
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
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
                    hidden: { opacity: 0, y: 22 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ borderColor: 'rgba(192, 132, 252, 0.45)' }}
                >
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    required
                    disabled={isLoading}
                    className="h-11 rounded-lg bg-background/70 text-base shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/50 md:text-sm"
                  />
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-transparent px-1 py-2 text-sm text-muted-foreground transition"
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <motion.label
                    htmlFor="remember"
                    className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 transition"
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(148, 163, 184, 0.15)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Checkbox id="remember" disabled={isLoading} />
                    <span>Keep me signed in</span>
                  </motion.label>
                  <motion.button
                    type="button"
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80 disabled:pointer-events-none disabled:opacity-50"
                    disabled={isLoading}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Forgot password?
                  </motion.button>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -1 }}
                >
                  <Button asChild className="w-full" disabled={isLoading}>
                    <motion.button
                      // type="submit"
                      onClick={goToHome}
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.01 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isLoading ? (
                          <motion.span
                            key="loading"
                            className="flex items-center justify-center gap-2"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                          >
                            <motion.span
                              className="grid place-items-center"
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                ease: 'linear',
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
                              Signing in…
                            </motion.span>
                          </motion.span>
                        ) : (
                          <motion.span
                            key="enter"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.2 }}
                          >
                            Sign in
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
                    transition: { delayChildren: 0.4, staggerChildren: 0.1 },
                  },
                }}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <AuthDivider />
                </motion.div>

                <motion.div
                  className="grid gap-3 sm:grid-cols-2"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { staggerChildren: 0.08 },
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
                          hidden: { opacity: 0, y: 16, scale: 0.96 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                              delay: index * 0.02,
                              type: 'spring',
                              stiffness: 240,
                              damping: 20,
                            },
                          },
                        }}
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <provider.icon className="size-4" />
                        <span className="text-sm font-medium">{provider.label}</span>
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
