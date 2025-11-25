import { useState, useCallback, useEffect, type JSX } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react';
import { Heart, RotateCcw, X, Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '@/features/dashboard/hooks/useLocation';
import { useDrag } from '@use-gesture/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Spinner } from '@/components/ui/spinner';
import {
  fetchRecommendations,
  useRecommendationsQuery,
  useRestaurantById,
} from '@/features/dashboard/data/hooks';
import { useMealmapStore } from '@/features/dashboard/store/useMealmapStore';
import { RecommendationCard } from '@/features/dashboard/recommendations/components/RecommendationCard';
import { useCreateSwipeMutation } from '@/features/dashboard/recommendations/api';
import type {
  MealRecommendation,
  PlaceBasicInfo,
  RecommendationResponse,
} from '@/features/dashboard/types';

const RECOMMENDATION_BATCH_SIZE = 5;

const generateSessionId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export function RecommendationsPage(): JSX.Element {
  const navigate = useNavigate();
  const { userLocation } = useLocation();
  const {
    data: initialBatch = [],
    isPending,
    error,
    refetch,
  } = useRecommendationsQuery({
    limit: RECOMMENDATION_BATCH_SIZE,
    lat: userLocation?.lat,
    long: userLocation?.lng,
  });
  const [recommendations, setRecommendations] = useState<MealRecommendation[]>(initialBatch);

  const [activeIndex, setActiveIndex] = useState(0);
  const [swipeIntent, setSwipeIntent] = useState<RecommendationResponse | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [remoteExhausted, setRemoteExhausted] = useState(false);

  useEffect(() => {
    if (recommendations.length === 0 && initialBatch.length > 0) {
      setRecommendations(initialBatch);
    }
  }, [initialBatch, recommendations.length]);

  const markRecommendation = useMealmapStore((state) => state.markRecommendation);
  const feedback = useMealmapStore((state) => state.recommendationFeedback);
  const swipeSessionId = useMealmapStore((state) => state.swipeSessionId);
  const setSwipeSessionId = useMealmapStore((state) => state.setSwipeSessionId);

  useEffect(() => {
    if (!swipeSessionId && recommendations.length > 0) {
      setSwipeSessionId(generateSessionId());
    }
  }, [swipeSessionId, recommendations.length, setSwipeSessionId]);

  const swipeMutation = useCreateSwipeMutation();

  const resolveSessionId = useCallback(() => {
    if (swipeSessionId) {
      return swipeSessionId;
    }
    const newSessionId = generateSessionId();
    setSwipeSessionId(newSessionId);
    return newSessionId;
  }, [swipeSessionId, setSwipeSessionId]);

  const fetchNextBatch = useCallback(async () => {
    if (isPrefetching || remoteExhausted) {
      return;
    }

    setIsPrefetching(true);
    try {
      const nextBatch = await fetchRecommendations({
        lat: userLocation?.lat,
        long: userLocation?.lng,
        limit: RECOMMENDATION_BATCH_SIZE,
      });
      if (nextBatch.length === 0) {
        setRemoteExhausted(true);
        return;
      }

      setRecommendations((prev) => {
        const existingIds = new Set(prev.map((rec) => rec.id));
        const additions = nextBatch.filter((rec) => !existingIds.has(rec.id));
        if (additions.length === 0) {
          return prev;
        }
        return [...prev, ...additions];
      });
    } catch {
      toast.error('Unable to load more recommendations right now.');
    } finally {
      setIsPrefetching(false);
    }
  }, [isPrefetching, remoteExhausted, userLocation?.lat, userLocation?.lng]);

  useEffect(() => {
    if (!recommendations.length || remoteExhausted) {
      return;
    }
    const remaining = recommendations.length - activeIndex;
    if (remaining <= 2) {
      void fetchNextBatch();
    }
  }, [recommendations.length, activeIndex, fetchNextBatch, remoteExhausted]);

  // Active Card Data
  const activeRecommendation = recommendations[activeIndex];
  const activeRestaurant = useRestaurantById(activeRecommendation?.restaurantId);
  const activeRestaurantName =
    activeRecommendation?.restaurantName ??
    activeRestaurant?.name ??
    activeRecommendation?.restaurantId ??
    'Loading...';

  // Next Card Data (for background stack)
  const nextRecommendation = recommendations[activeIndex + 1];
  // We don't fetch restaurant for next card to save resources,
  // it will load when it becomes active.
  const nextRestaurantName =
    nextRecommendation?.restaurantName ?? nextRecommendation?.restaurantId ?? 'Loading...';

  const computeDistanceMeters = useCallback(
    (restaurant?: PlaceBasicInfo) => {
      if (
        !userLocation ||
        !restaurant ||
        typeof restaurant.latitude !== 'number' ||
        typeof restaurant.longitude !== 'number'
      ) {
        return undefined;
      }

      const toRadians = (value: number) => (value * Math.PI) / 180;
      const earthRadius = 6371000; // meters

      const lat1 = toRadians(userLocation.lat);
      const lat2 = toRadians(restaurant.latitude);
      const deltaLat = toRadians(restaurant.latitude - userLocation.lat);
      const deltaLng = toRadians(restaurant.longitude - userLocation.lng);

      const a =
        Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return Math.round(earthRadius * c);
    },
    [userLocation]
  );

  const formatDistanceLabel = useCallback((meters?: number | null): string | undefined => {
    if (typeof meters !== 'number' || Number.isNaN(meters)) {
      return undefined;
    }
    if (meters <= 0) {
      return 'Nearby';
    }

    const km = meters / 1000;
    const distanceText = km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(meters)} m`;
    const minutes = Math.max(1, Math.round(meters / 80));
    return `${distanceText} · ${minutes} min`;
  }, []);

  const resolveDistanceLabel = useCallback(
    (recommendation?: MealRecommendation, restaurant?: PlaceBasicInfo) => {
      if (!recommendation && !restaurant) return undefined;
      return (
        recommendation?.distance ??
        restaurant?.distance ??
        formatDistanceLabel(restaurant?.distance_meters ?? computeDistanceMeters(restaurant))
      );
    },
    [computeDistanceMeters, formatDistanceLabel]
  );

  const activeDistanceLabel = resolveDistanceLabel(activeRecommendation, activeRestaurant);
  const nextDistanceLabel = resolveDistanceLabel(nextRecommendation);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const opacity = useTransform(x, [-220, 0, 220], [0.8, 1, 0.8]); // Fade out slightly on extreme swipe

  const settleCard = useCallback(
    (direction?: RecommendationResponse) => {
      if (!direction) {
        animate(x, 0, { type: 'spring', bounce: 0.5, duration: 0.6 });
        setSwipeIntent(null);
        return;
      }

      if (!activeRecommendation) {
        setSwipeIntent(null);
        return;
      }

      const target = direction === 'liked' ? 500 : -500;
      animate(x, target, { duration: 0.25, ease: 'easeInOut' }).then(() => {
        x.set(0);
        setSwipeIntent(null);
        markRecommendation(activeRecommendation.id, direction);
        const sessionId = resolveSessionId();
        swipeMutation.mutate(
          {
            meal_id: activeRecommendation.id,
            liked: direction === 'liked',
            session_id: sessionId,
          },
          {
            onError: () => {
              toast.error('Failed to send your swipe. Please try again.');
            },
          }
        );
        setActiveIndex((prev) => prev + 1);
      });
    },
    [activeRecommendation, markRecommendation, resolveSessionId, swipeMutation, x]
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

  if (error && recommendations.length === 0 && !isPending) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-muted-foreground">Unable to load recommendations.</p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  if (isPending && recommendations.length === 0) {
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
          <Button onClick={() => navigate('/map')}>Go to Map</Button>
        </div>
      </div>
    );
  }

  if (!isPending && recommendations.length === 0) {
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
                distanceLabel={nextDistanceLabel}
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
                distanceLabel={activeDistanceLabel}
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
        {isPrefetching && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner className="size-3" />
            Fetching more picks…
          </div>
        )}
      </footer>
    </div>
  );
}
