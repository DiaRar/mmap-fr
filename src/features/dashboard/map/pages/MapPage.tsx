import type { JSX } from 'react';
import { MapPin, Navigation, Sparkles, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

import { restaurantBounds, useRestaurantsQuery } from '@/features/dashboard/data/hooks';
import { useMealmapStore } from '@/features/dashboard/store/useMealmapStore';
import type { NearbyRestaurant } from '@/features/dashboard/types';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getMarkerPosition = (restaurant: NearbyRestaurant) => {
  const latRange = Math.max(restaurantBounds.maxLat - restaurantBounds.minLat, 0.005);
  const lngRange = Math.max(restaurantBounds.maxLng - restaurantBounds.minLng, 0.005);

  const x =
    ((restaurant.coordinates.lng - restaurantBounds.minLng) / lngRange) * 100;
  const y =
    ((restaurantBounds.maxLat - restaurant.coordinates.lat) / latRange) * 100;

  return {
    x: clamp(x, 5, 95),
    y: clamp(y, 8, 92),
  };
};

function formatRelativeReview(date?: string) {
  if (!date) {
    return null;
  }

  const deltaMs = Date.now() - new Date(date).getTime();
  const hours = Math.floor(deltaMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function MapPage(): JSX.Element {
  const { data: restaurants = [], isPending } = useRestaurantsQuery();
  const selectedRestaurantId = useMealmapStore((state) => state.selectedRestaurantId);
  const selectRestaurant = useMealmapStore((state) => state.selectRestaurant);
  const navigate = useNavigate();

  const selectedRestaurant =
    restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? restaurants[0];

  return (
    <div className="flex flex-1 flex-col">
      <motion.header
        className="flex flex-col gap-3 px-5 pb-4 pt-6 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="size-4" />
          Live heatmap
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
            Find nearby kitchens
          </h1>
          <p className="text-sm text-muted-foreground">
            Tap a marker to see community intel, wait times, and quick links to leave a review.
          </p>
        </div>
      </motion.header>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-24 sm:px-6 lg:px-8 lg:pb-16">
        <motion.section
          className="space-y-4 rounded-3xl border border-border/40 bg-background/80 p-4 shadow-sm shadow-primary/5 backdrop-blur"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
        >
          <div className="relative h-[420px] overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-secondary/40">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:140px_140px] opacity-60" />
            {isPending ? (
              <div className="flex h-full items-center justify-center">
                <Spinner />
              </div>
            ) : (
              restaurants.map((restaurant) => {
                const position = getMarkerPosition(restaurant);
                const isActive = restaurant.id === selectedRestaurant?.id;
                return (
                  <button
                    key={restaurant.id}
                    type="button"
                    className="group absolute -translate-x-1/2 -translate-y-full focus-visible:outline-none"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                    }}
                    onClick={() => selectRestaurant(restaurant.id)}
                    aria-label={`View ${restaurant.name} details on map`}
                  >
                    <div
                      className="flex items-center gap-2 rounded-full border border-border/40 bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow backdrop-blur"
                      aria-hidden="true"
                    >
                      <span className="inline-flex items-center gap-1 text-primary">
                        <MapPin className="size-3.5" />
                        {restaurant.area}
                      </span>
                      <span>{restaurant.rating.toFixed(1)}</span>
                    </div>
                    <div
                      className={`mx-auto mt-2 flex size-11 items-center justify-center rounded-full border-2 shadow transition ${isActive ? 'border-primary bg-primary text-primary-foreground shadow-primary/40' : 'border-white/70 bg-white text-primary shadow-primary/10'}`}
                    >
                      <MapPin className="size-5" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <Separator />

          <Card className="border-none bg-transparent p-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {selectedRestaurant?.name ?? 'Pick a marker'}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {selectedRestaurant
                      ? `${selectedRestaurant.cuisine} · ${selectedRestaurant.distance} away`
                      : 'Tap a hotspot to see quick facts'}
                  </CardDescription>
                </div>
                {selectedRestaurant ? (
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {selectedRestaurant.priceRange}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-0 pb-0">
              {selectedRestaurant ? (
                <>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Navigation className="size-4 text-primary" />
                      {selectedRestaurant.etaMinutes} min walk
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4 text-primary" />
                      Queue {selectedRestaurant.queueEstimateMinutes ?? 10} min
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="size-4 text-primary" />
                      {formatRelativeReview(selectedRestaurant.lastReviewAt) ?? 'No recent reviews'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRestaurant.tags.concat(selectedRestaurant.dietaryTags ?? []).map(
                      (tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {tag}
                        </Badge>
                      )
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="flex-1 rounded-full"
                      onClick={() => selectRestaurant(undefined)}
                      type="button"
                      variant="secondary"
                    >
                      Browse other pins
                    </Button>
                    <Button className="flex-1 rounded-full" onClick={() => navigate('/')} type="button">
                      View reviews
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Markers highlight the most-reviewed restaurants around KAIST. Each tap reveals
                  walk time, current vibe, and dietary context pulled from the latest community
                  posts.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </main>

    </div>
  );
}
