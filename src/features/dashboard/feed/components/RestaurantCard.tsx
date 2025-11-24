import { Bookmark, Clock, MapPin, Star } from 'lucide-react';
import type { JSX } from 'react';

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
import { Link } from 'react-router-dom';

import type { PlaceBasicInfo } from '../../types';

const MAX_TITLE_LENGTH = 30;

function formatRelativeReview(date?: string): string | null {
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

function formatDistance(distance?: number | null): string | null {
  if (distance === undefined || distance === null) {
    return null;
  }

  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }

  const km = distance / 1000;
  return `${km.toFixed(km >= 10 ? 0 : 1)} km`;
}

function formatCuisine(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  return value
    .split(/[_\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export interface RestaurantCardProps {
  restaurant: PlaceBasicInfo;
  onBookmark?: (restaurantId: string) => void;
  isBookmarked?: boolean;
}

export function RestaurantCard({
  restaurant,
  onBookmark,
  isBookmarked = false,
}: RestaurantCardProps): JSX.Element {
  const lastReview = formatRelativeReview(restaurant.lastReviewAt);
  const queueMinutes = restaurant.queueEstimateMinutes ?? 10;
  const ratingValue =
    typeof restaurant.rating === 'number'
      ? restaurant.rating
      : typeof restaurant.average_rating === 'number'
        ? restaurant.average_rating
        : undefined;
  const reviewCount = restaurant.reviewCount ?? restaurant.review_count;
  const distanceLabel = restaurant.distance ?? formatDistance(restaurant.distance_meters);
  const cuisineLabel = formatCuisine(restaurant.cuisine);
  const areaLabel = restaurant.area ?? restaurant.address;
  const etaMinutes = restaurant.etaMinutes;
  const primaryImage = restaurant.imageUrl ?? restaurant.first_image?.image_url;
  const imageCount = restaurant.image_count ?? (primaryImage ? 1 : undefined);
  const tags = restaurant.tags ?? (cuisineLabel ? [cuisineLabel] : []);

  const handleBookmark = () => {
    onBookmark?.(restaurant.id);
  };

  return (
    <Card className="group w-full max-w-full overflow-hidden rounded-3xl border border-border/50 bg-white/90 shadow-md shadow-primary/5 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-within:-translate-y-0.5 focus-within:shadow-xl">
      <div className="relative h-40 w-full overflow-hidden sm:h-48">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={restaurant.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <MapPin className="size-6" />
          </div>
        )}
        {imageCount && imageCount > 1 ? (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-0.5 text-xs font-medium text-white">
            +{imageCount - 1}
          </div>
        ) : null}
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

      <CardHeader className="min-w-0 space-y-1 px-5 pb-2 sm:px-6">
        <CardTitle className="flex items-start justify-between gap-2 text-lg tracking-tight text-foreground">
          <span className="max-w-[70%] truncate font-semibold leading-tight">
            {truncateTitle(restaurant.name)}
            <span className="block text-xs font-normal uppercase tracking-wide text-muted-foreground">
              {areaLabel ?? 'Nearby'}
            </span>
          </span>
          {typeof ratingValue === 'number' ? (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 rounded-full border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
            >
              <Star className="size-3.5 fill-current" />
              {ratingValue.toFixed(1)}
            </Badge>
          ) : null}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
          {[cuisineLabel, restaurant.priceRange, reviewCount ? `${reviewCount.toLocaleString()} reviews` : null]
            .filter(Boolean)
            .join(' · ')}
        </CardDescription>
      </CardHeader>

      <CardContent className="min-w-0 space-y-3 px-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {distanceLabel ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" />
              {distanceLabel}
            </span>
          ) : null}
          {(distanceLabel && (etaMinutes || queueMinutes)) ? (
            <Separator orientation="vertical" className="h-4 bg-border/60" />
          ) : null}
          {etaMinutes ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-primary" />
              {etaMinutes} min · Queue {queueMinutes}m
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-primary" />
              Queue {queueMinutes}m
            </span>
          )}
          {lastReview ? (
            <>
              <Separator orientation="vertical" className="h-4 bg-border/60" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Updated {lastReview}
              </span>
            </>
          ) : null}
        </div>
        {tags.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="max-w-full flex-wrap rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary whitespace-normal break-words"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
        {restaurant.dietaryTags?.length ? (
          <div className="flex flex-wrap gap-2">
            {restaurant.dietaryTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="max-w-full flex-wrap rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-800 whitespace-normal break-words"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="min-w-0 justify-between gap-3 px-5 pb-5 pt-0 sm:px-6">
        <div className="flex-1 text-sm text-muted-foreground">
          <p className="line-clamp-2 break-words">“Everything here feels curated with care.”</p>
          <p className="text-xs">Latest review {lastReview ?? 'pending'}</p>
        </div>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="rounded-full px-4 transition-transform duration-300 group-hover:translate-x-0.5"
        >
          <Link to={`/restaurants/${restaurant.id}`} aria-label={`View ${restaurant.name} details`}>
            View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function truncateTitle(value: string, maxLength = MAX_TITLE_LENGTH): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}
