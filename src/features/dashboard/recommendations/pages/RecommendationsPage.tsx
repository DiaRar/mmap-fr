import { useState, useCallback, type JSX } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react';
import { Heart, RotateCcw, X, Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDrag } from '@use-gesture/react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Spinner } from '@/components/ui/spinner';
import { useRecommendationsQuery, useRestaurantById } from '@/features/dashboard/data/hooks';
import { useMealmapStore } from '@/features/dashboard/store/useMealmapStore';
import { RecommendationCard } from '@/features/dashboard/recommendations/components/RecommendationCard';
import type { RecommendationResponse } from '@/features/dashboard/types';

export function RecommendationsPage(): JSX.Element {
  const navigate = useNavigate();
  const { data: recommendations = [], isPending } = useRecommendationsQuery();
  const [activeIndex, setActiveIndex] = useState(0);
  const [swipeIntent, setSwipeIntent] = useState<RecommendationResponse | null>(null);

  const markRecommendation = useMealmapStore((state) => state.markRecommendation);
  const feedback = useMealmapStore((state) => state.recommendationFeedback);

  // Active Card Data
  const activeRecommendation = recommendations[activeIndex];
  const activeRestaurant = useRestaurantById(activeRecommendation?.restaurantId);
  const activeRestaurantName = activeRestaurant?.name ?? activeRecommendation?.restaurantId;

  // Next Card Data (for background stack)
  const nextRecommendation = recommendations[activeIndex + 1];
  // We don't fetch restaurant for next card to save resources, 
  // it will load when it becomes active.
  const nextRestaurantName = nextRecommendation?.restaurantId; 

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const opacity = useTransform(x, [-220, 0, 220], [0.8, 1, 0.8]); // Fade out slightly on extreme swipe

  const activeRecommendationId = activeRecommendation?.id;

  const settleCard = useCallback(
    (direction?: RecommendationResponse) => {
      if (!direction) {
        animate(x, 0, { type: 'spring', bounce: 0.5, duration: 0.6 });
        setSwipeIntent(null);
        return;
      }

      const target = direction === 'liked' ? 500 : -500;
      animate(x, target, { duration: 0.25, ease: 'easeInOut' }).then(() => {
        x.set(0);
        setSwipeIntent(null);
        if (!activeRecommendationId) return;
        
        markRecommendation(activeRecommendationId, direction);
        setActiveIndex((prev) => prev + 1);
      });
    },
    [activeRecommendationId, markRecommendation, x]
  );

  const bind = useDrag(
    ({ down, movement: [mx], velocity: [vx], direction: [dx] }) => {
      if (!activeRecommendation) return;

      if (down) {
        x.set(mx);
        // Lower threshold for visual feedback
        if (mx > 20) setSwipeIntent('liked');
        else if (mx < -20) setSwipeIntent('dismissed');
        else setSwipeIntent(null);
        return;
      }

      const trigger = Math.abs(mx) > 100 || vx > 0.5;
      if (trigger) {
        settleCard(dx > 0 ? 'liked' : 'dismissed');
      } else {
        settleCard();
      }
    },
    { filterTaps: true }
  );

  const dragBindings = bind() as Record<string, unknown>;

  const stats = Object.values(feedback).reduce(
      (acc, current) => {
        acc[current] += 1;
        return acc;
      },
      { liked: 0, dismissed: 0 }
    );

  const hasMore = activeIndex < recommendations.length;

  const handleOpenMealDetails = useCallback(() => {
    if (!activeRecommendation) {
      return;
    }
    navigate(`/meals/${activeRecommendation.id}`, {
      state: {
        placeId: activeRecommendation.restaurantId,
        restaurantName: activeRestaurantName,
        mealName: activeRecommendation.title,
      },
    });
  }, [activeRecommendation, activeRestaurantName, navigate]);

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!hasMore && recommendations.length > 0) {
  return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="rounded-full bg-primary/10 p-6 text-primary">
          <Sparkles className="size-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">That's all for now!</h2>
          <p className="text-muted-foreground">
            You've reviewed all our recommendations. Come back later for more.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setActiveIndex(0)}>
            <RotateCcw className="mr-2 size-4" />
            Start Over
                </Button>
          <Button onClick={() => navigate('/map')}>
            Go to Map
                </Button>
                      </div>
                    </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No recommendations found.</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Explore Feed
        </Button>
                    </div>
    );
  }

  return (
    <div className="flex h-full flex-col w-full overflow-hidden">
      {/* Header */}
      <motion.header 
        className="flex items-center justify-between px-6 py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight">Daily Picks</h1>
          <p className="text-xs text-muted-foreground">Curated just for you</p>
                    </div>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Info className="size-5 text-muted-foreground" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Your Taste Profile</DrawerTitle>
              </DrawerHeader>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div className="rounded-2xl bg-green-50 p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.liked}</div>
                  <div className="text-sm font-medium text-green-700">Saved</div>
                      </div>
                <div className="rounded-2xl bg-red-50 p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">{stats.dismissed}</div>
                  <div className="text-sm font-medium text-red-700">Skipped</div>
                      </div>
                    </div>
              <div className="p-4">
            <Button
                  variant="outline" 
                  className="w-full" 
              onClick={() => setActiveIndex(0)}
              disabled={Object.keys(feedback).length === 0}
            >
                  <RotateCcw className="mr-2 size-4" />
                  Reset History
            </Button>
          </div>
            </div>
          </DrawerContent>
        </Drawer>
      </motion.header>

      {/* Card Stack Area */}
      <main className="relative flex-1 px-4 pb-4 flex justify-center">
        <div className="relative h-full w-full max-w-md">
          <AnimatePresence>
            {/* Background Card (Next) */}
            {nextRecommendation && (
              <RecommendationCard
                key={nextRecommendation.id}
                recommendation={nextRecommendation}
                restaurantName={nextRestaurantName || 'Loading...'}
                style={{
                  scale: 0.95,
                  y: 20,
                  opacity: 0.6, // Dimmed
                }}
              />
            )}

            {/* Foreground Card (Active) */}
            {activeRecommendation && (
              <RecommendationCard
                key={activeRecommendation.id}
                recommendation={activeRecommendation}
                restaurantName={activeRestaurantName || 'Loading...'}
                style={{ x, rotate, opacity }}
                dragHandlers={dragBindings}
                swipeIntent={swipeIntent}
                isFront={true}
              />
            )}
          </AnimatePresence>
          </div>
      </main>

      {/* Bottom Controls */}
      <footer className="flex flex-col items-center gap-4 pb-6 pt-2">
        <Button
          variant="secondary"
          className="rounded-full px-6"
          onClick={handleOpenMealDetails}
          disabled={!activeRecommendation}
        >
          View meal details
        </Button>
        <div className="flex items-center justify-center gap-8">
          <Button
            size="lg"
            variant="outline"
            className="size-14 rounded-full border-2 border-red-100 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 shadow-sm"
            onClick={() => settleCard('dismissed')}
          >
            <X className="size-6" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="size-14 rounded-full border-2 border-green-100 bg-white text-green-500 hover:bg-green-50 hover:text-green-600 shadow-sm"
            onClick={() => settleCard('liked')}
          >
            <Heart className="size-6 fill-current" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
