import { ScrollArea } from '@/components/ui/scroll-area';

import type { NearbyRestaurant } from '../types';
import { RestaurantCard } from './RestaurantCard';
import type { JSX } from 'react';

export interface RestaurantListProps {
  restaurants: NearbyRestaurant[];
  onBookmark?: (restaurantId: string) => void;
  bookmarked?: Record<string, boolean>;
}

export function RestaurantList({
  restaurants,
  onBookmark,
  bookmarked,
}: RestaurantListProps): JSX.Element {
  if (restaurants.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed bg-muted/20 p-8 text-center">
        <p className="text-base font-semibold text-foreground">No restaurants found</p>
        <p className="max-w-[260px] text-sm text-muted-foreground">
          Try updating your search or filters to discover new spots nearby.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="-mx-2 flex-1 px-2">
      <div className="flex flex-col gap-4 pb-16">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onBookmark={onBookmark}
            isBookmarked={Boolean(bookmarked?.[restaurant.id])}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
