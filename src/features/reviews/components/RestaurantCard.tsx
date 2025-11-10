import { Bookmark, Clock, MapPin, Star } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import type { NearbyRestaurant } from '../types';
import type { JSX } from 'react';

export interface RestaurantCardProps {
  restaurant: NearbyRestaurant;
  onBookmark?: (restaurantId: string) => void;
  isBookmarked?: boolean;
}

export function RestaurantCard({
  restaurant,
  onBookmark,
  isBookmarked = false,
}: RestaurantCardProps): JSX.Element {
  const handleBookmark = () => {
    onBookmark?.(restaurant.id);
  };

  return (
    <Card className="group overflow-hidden rounded-3xl border border-border/50 bg-white/90 shadow-md shadow-primary/5 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-within:-translate-y-0.5 focus-within:shadow-xl">
      <div className="relative h-40 w-full overflow-hidden sm:h-48">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex gap-2">
          {restaurant.isNew ? (
            <Badge className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
              New
            </Badge>
          ) : null}
          {restaurant.isPopular ? (
            <Badge
              variant="secondary"
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground shadow"
            >
              Popular
            </Badge>
          ) : null}
        </div>
        <Button
          type="button"
          onClick={handleBookmark}
          variant="secondary"
          size="icon"
          className="absolute right-3 top-3 size-9 rounded-full bg-white/85 text-primary shadow transition hover:bg-primary hover:text-primary-foreground focus-visible:ring-primary/40"
          aria-label={`${isBookmarked ? 'Remove bookmark for' : 'Bookmark'} ${restaurant.name}`}
        >
          <Bookmark className="size-4" fill={isBookmarked ? 'currentColor' : 'none'} />
        </Button>
      </div>

      <CardHeader className="space-y-1 px-5 pb-2 sm:px-6">
        <CardTitle className="flex items-start justify-between text-lg tracking-tight text-foreground">
          <span className="max-w-[70%] truncate font-semibold">{restaurant.name}</span>
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 rounded-full border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
          >
            <Star className="size-3.5 fill-current" />
            {restaurant.rating.toFixed(1)}
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {restaurant.cuisine} · {restaurant.priceRange} · {restaurant.reviewCount.toLocaleString()}{' '}
          reviews
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 px-5 sm:px-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 text-primary" />
            {restaurant.distance}
          </span>
          <Separator orientation="vertical" className="h-4 bg-border/60" />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-primary" />
            {restaurant.etaMinutes} min
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {restaurant.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-between px-5 pb-5 pt-0 sm:px-6">
        <div className="text-sm text-muted-foreground">
          <p>“Everything here feels curated with care.”</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full px-4 transition-transform duration-300 group-hover:translate-x-0.5"
        >
          View
        </Button>
      </CardFooter>
    </Card>
  );
}
