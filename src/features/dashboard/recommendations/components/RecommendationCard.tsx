import { motion, type MotionStyle, type MotionValue } from 'motion/react';
import { Heart, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MealRecommendation, RecommendationResponse } from '@/features/dashboard/types';

interface RecommendationCardProps {
  recommendation: MealRecommendation;
  restaurantName: string;
  style?: {
    x?: MotionValue<number> | number;
    rotate?: MotionValue<number> | number;
    opacity?: MotionValue<number> | number;
    scale?: MotionValue<number> | number;
    y?: MotionValue<number> | number;
  };
  dragHandlers?: Record<string, unknown>;
  swipeIntent?: RecommendationResponse | null;
  isFront?: boolean;
}

export function RecommendationCard({
  recommendation,
  restaurantName,
  style,
  dragHandlers,
  swipeIntent,
  isFront = false,
}: RecommendationCardProps) {
  const tags = recommendation.tags ?? [];
  const priceLabel = recommendation.price ?? '—';
  const descriptionText = recommendation.description ?? 'Tap to learn more.';

  const matchBadge =
    typeof recommendation.matchScore === 'number'
      ? (
          <Badge
            variant="secondary"
            className={cn(
              'ml-auto border-0 backdrop-blur-md',
              recommendation.matchScore > 80
                ? 'bg-green-500/80 text-white'
                : 'bg-black/40 text-white'
            )}
          >
            Match {recommendation.matchScore}%
          </Badge>
        )
      : typeof recommendation.rating === 'number'
        ? (
            <Badge className="ml-auto border-0 bg-black/40 text-white backdrop-blur-md" variant="secondary">
              {recommendation.rating.toFixed(1)}★ avg
            </Badge>
          )
        : null;

  return (
    <motion.div
      style={style as MotionStyle}
      className={cn(
        "absolute inset-0 h-full w-full touch-none select-none will-change-transform",
        isFront ? "z-10" : "z-0"
      )}
      {...(isFront ? dragHandlers : {})}
    >
      <Card className="relative h-full w-full overflow-hidden rounded-3xl border-0 shadow-xl">
        {/* Image Section - Takes up full height with gradient overlay */}
        <div className="absolute inset-0">
          {recommendation.imageUrl ? (
            <img
              src={recommendation.imageUrl}
              alt={recommendation.title}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          )}
          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
        </div>

        {/* Swipe Indicators (Only visible on front card during interaction) */}
        {isFront && swipeIntent && (
          <div
            className={cn(
              "absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-200",
              swipeIntent === 'liked' ? "bg-green-500/20" : "bg-red-500/20"
            )}
          >
            <div className={cn(
              "rounded-full border-4 p-4",
              swipeIntent === 'liked' ? "border-green-400 text-green-400" : "border-red-400 text-red-400"
            )}>
              {swipeIntent === 'liked' ? (
                <Heart className="size-12 fill-current" />
              ) : (
                <X className="size-12" />
              )}
            </div>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-start gap-2 p-4">
          {recommendation.distance && (
            <Badge variant="secondary" className="border-0 bg-black/40 text-white backdrop-blur-md">
              {recommendation.distance}
            </Badge>
          )}
          {matchBadge}
        </div>

        {/* Content - Bottom aligned */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10 flex flex-col gap-3">
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold leading-tight shadow-black drop-shadow-md">
                {recommendation.title}
              </h2>
              <span className="text-lg font-semibold text-white/90 shadow-black drop-shadow-md">
                {priceLabel}
              </span>
            </div>
            <p className="text-lg font-medium text-white/80 shadow-black drop-shadow-sm">
              {restaurantName}
            </p>
          </div>

          <p className="line-clamp-2 text-sm text-white/90 shadow-black drop-shadow-sm">
            {descriptionText}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-white/30 bg-white/10 text-xs text-white backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
            {recommendation.calories && (
              <Badge variant="outline" className="border-white/30 bg-white/10 text-xs text-white backdrop-blur-sm">
                {recommendation.calories} kcal
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
