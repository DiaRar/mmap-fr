import type { JSX } from 'react';
import { MapPin, Star, Clock, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type ReviewResponse } from '@/features/dashboard/types';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

export interface ReviewCardProps {
  review: ReviewResponse;
}

export function ReviewCard({ review }: ReviewCardProps): JSX.Element {
  const distance = review.distance_meters 
    ? review.distance_meters < 1000 
      ? `${Math.round(review.distance_meters)}m` 
      : `${(review.distance_meters / 1000).toFixed(1)}km`
    : null;

  return (
    <Card className="group overflow-hidden rounded-3xl border border-border/50 bg-white/90 shadow-md shadow-primary/5 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      {review.first_image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={review.first_image.image_url}
            alt={review.meal_name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      )}

      <CardHeader className="space-y-1 px-5 pb-2 sm:px-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {review.user.image_url ? (
              <img src={review.user.image_url} alt={review.user.first_name} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <User className="w-3 h-3" />
              </div>
            )}
            <span className="text-xs font-medium text-muted-foreground">
              {review.user.first_name} {review.user.last_name}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(review.created_at)}</span>
        </div>
        
        <CardTitle className="flex items-start justify-between text-lg tracking-tight text-foreground mt-2">
          <span className="font-semibold">
            {review.meal_name}
            <span className="block text-sm font-normal text-muted-foreground">
              at {review.place.name}
            </span>
          </span>
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 rounded-full border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
          >
            <Star className="size-3.5 fill-current" />
            {review.rating}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 px-5 sm:px-6">
        {review.text && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            "{review.text}"
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {distance && (
            <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-primary" />
                {distance}
            </span>
            )}
            {review.waiting_time_minutes !== null && (
                <>
                     <Separator orientation="vertical" className="h-4 bg-border/60" />
                     <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-4 text-primary" />
                        {review.waiting_time_minutes}m wait
                    </span>
                </>
            )}
        </div>
        
        <div className="flex flex-wrap gap-2">
            {review.is_vegan === 'yes' && <Badge variant="outline" className="text-xs">Vegan</Badge>}
            {review.is_halal === 'yes' && <Badge variant="outline" className="text-xs">Halal</Badge>}
            {review.is_vegetarian === 'yes' && <Badge variant="outline" className="text-xs">Vegetarian</Badge>}
            {review.is_spicy === 'yes' && <Badge variant="outline" className="text-xs">Spicy</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

