import { useMemo, useState, useCallback, type JSX } from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'motion/react';
import { ArrowLeftRight, Heart, RotateCcw, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDrag } from '@use-gesture/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useRecommendationsQuery, useRestaurantById } from '@/features/dashboard/data/hooks';
import { useMealmapStore } from '@/features/dashboard/store/useMealmapStore';
import type { RecommendationResponse } from '@/features/dashboard/types';

const RESPONSE_LABELS: Record<RecommendationResponse, string> = {
  liked: 'Saved',
  dismissed: 'Skipped',
};

export function RecommendationsPage(): JSX.Element {
  const navigate = useNavigate();
  const { data: recommendations = [], isPending } = useRecommendationsQuery();
  const [activeIndex, setActiveIndex] = useState(0);

  const markRecommendation = useMealmapStore((state) => state.markRecommendation);
  const feedback = useMealmapStore((state) => state.recommendationFeedback);

  const activeRecommendation = recommendations[activeIndex % (recommendations.length || 1)];
  const activeRestaurant = useRestaurantById(activeRecommendation?.restaurantId);
  const [swipeIntent, setSwipeIntent] = useState<RecommendationResponse | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const opacity = useTransform(x, [-220, 0, 220], [0.5, 1, 0.5]);

  const activeRecommendationId = activeRecommendation?.id;
  const settleCard = useCallback(
    (direction?: RecommendationResponse) => {
      if (!direction) {
        animate(x, 0, { type: 'spring', bounce: 0.35, duration: 0.5 });
        setSwipeIntent(null);
        return;
      }

      const target = direction === 'liked' ? 500 : -500;
      animate(x, target, { duration: 0.35, ease: 'easeInOut' }).then(() => {
        x.set(0);
        setSwipeIntent(null);
        if (!activeRecommendationId) {
          return;
        }
        markRecommendation(activeRecommendationId, direction);
        setActiveIndex((index) => index + 1);
      });
    },
    [activeRecommendationId, markRecommendation, x]
  );

  const bind = useDrag(
    ({ down, movement: [mx], velocity: [vx], direction: [dx] }) => {
      if (!activeRecommendation) {
        return;
      }

      if (down) {
        x.set(mx);
        setSwipeIntent(mx > 25 ? 'liked' : mx < -25 ? 'dismissed' : null);
        return;
      }

      const trigger = Math.abs(mx) > 120 || vx > 0.45;
      if (trigger) {
        settleCard(dx > 0 ? 'liked' : 'dismissed');
        return;
      }

      settleCard();
    },
    { filterTaps: true }
  );

  const dragBindings = bind() as Record<string, unknown>;

  const stats = useMemo(() => {
    return Object.values(feedback).reduce(
      (acc, current) => {
        acc[current] += 1;
        return acc;
      },
      { liked: 0, dismissed: 0 }
    );
  }, [feedback]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-col gap-3 px-5 pb-4 pt-6 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="size-4" />
          Taste Engine
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
            Recommendations just for you
          </h1>
          <p className="text-sm text-muted-foreground">
            Swipe through meals curated from your saved spots, price comfort zone, and dietary wins.
          </p>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 pb-24 sm:px-6 lg:px-8 lg:pb-16">
        <section className="flex flex-1 flex-col gap-5 rounded-3xl border border-border/40 bg-background/80 p-4 shadow-sm shadow-primary/5 backdrop-blur">
          {isPending ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner />
            </div>
          ) : recommendations.length === 0 ? (
            <Card className="border-dashed border-border/60 bg-muted/20">
              <CardHeader>
                <CardTitle>No recommendations yet</CardTitle>
                <CardDescription>
                  Once you save or review a few restaurants we’ll keep this carousel fresh with
                  personalised picks.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center gap-3">
                <Button className="rounded-full" onClick={() => navigate('/')}>
                  Explore the feed
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => navigate('/map')}>
                  Jump to the map
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={activeRecommendation?.id}
                  style={{ x, rotate, opacity }}
                  className="rounded-[28px] border border-border/40 bg-white shadow-xl shadow-primary/10 will-change-transform"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  {...dragBindings}
                >
                  <div className="relative h-64 w-full overflow-hidden rounded-t-[28px]">
                    <img
                      src={activeRecommendation?.imageUrl}
                      alt={activeRecommendation?.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-start justify-between p-5">
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm transition ${swipeIntent === 'liked' ? 'bg-white/85 text-primary' : 'bg-black/30 text-white/70'}`}
                      >
                        {activeRecommendation?.distance}
                      </div>
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition ${swipeIntent === 'dismissed' ? 'bg-white/85 text-destructive' : 'bg-white/70 text-primary'}`}
                      >
                        Match {activeRecommendation?.matchScore}%
                      </div>
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-16 text-white">
                      <p className="text-xs uppercase tracking-wide text-white/80">
                        {activeRecommendation?.title}
                      </p>
                      <p className="text-lg font-semibold">
                        {activeRestaurant?.name ?? activeRecommendation?.restaurantId?.replace(/-/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <CardContent className="space-y-4 px-5 py-5">
                    <div className="space-y-1">
                      <CardDescription className="text-sm text-muted-foreground">
                        {activeRecommendation?.highlight}
                      </CardDescription>
                    </div>
                    <p className="text-sm text-foreground">{activeRecommendation?.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {activeRecommendation?.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="rounded-2xl border border-border/40 bg-muted/20 p-3">
                        <p className="text-xs uppercase tracking-wide">Price</p>
                        <p className="text-base font-semibold text-foreground">
                          {activeRecommendation?.price}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/40 bg-muted/20 p-3">
                        <p className="text-xs uppercase tracking-wide">Calories</p>
                        <p className="text-base font-semibold text-foreground">
                          {activeRecommendation?.calories ?? '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/30 px-4 py-3 text-sm font-semibold">
                      <div className="inline-flex items-center gap-2 text-destructive">
                        <X className="size-4" />
                        Swipe left to skip
                      </div>
                      <div className="inline-flex items-center gap-2 text-primary">
                        <Heart className="size-4" />
                        Swipe right to save
                      </div>
                    </div>
                  </CardContent>
                </motion.article>
              </AnimatePresence>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border/40 bg-white/70 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Taste tracker</p>
              <p className="text-xs text-muted-foreground">
                Swipe right to save, left to skip. We adapt in real-time.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-xs font-semibold text-muted-foreground"
              onClick={() => setActiveIndex(0)}
              disabled={Object.keys(feedback).length === 0}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-3">
            {(['liked', 'dismissed'] as RecommendationResponse[]).map((key) => (
              <Card key={key} className="border-border/50 bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{RESPONSE_LABELS[key]}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline gap-2 pb-4">
                  <span className="text-3xl font-semibold tracking-tight text-foreground">
                    {stats[key]}
                  </span>
                  <span className="text-xs text-muted-foreground">meals</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button
            variant="secondary"
            className="mt-4 w-full rounded-full text-sm"
            onClick={() => navigate('/map')}
          >
            <ArrowLeftRight className="mr-2 size-4" />
            Jump to map hotspots
          </Button>
        </section>
      </main>

    </div>
  );
}
