import { useCallback, useMemo, useState, type ChangeEvent, type JSX } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Star,
  MapPin,
  Navigation,
  Clock,
  UtensilsCrossed,
  MessageSquareText,
  ChevronDown,
  ImageMinus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

import type { DietaryTag, MealResponse, MealTags, ReviewResponse } from '@/features/dashboard/types';
import { usePlaceDetails, usePlaceReviews } from '@/features/dashboard/restaurants/api';
import { useMeals } from '@/features/dashboard/meals/api';
import { DietaryTagSelector } from '@/features/dashboard/submission/components/DietaryTagSelector';
import { PhotoUploadField } from '@/features/dashboard/submission/components/PhotoUploadField';

const dietaryTagOptions = [
  'Halal',
  'Spicy',
  'Dairy-free',
  'Vegan',
  'Vegetarian',
  'Gluten-free',
  'Nut-free',
  'Low-carb',
] as const satisfies readonly DietaryTag[];

const currencyFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

function formatCurrency(value?: number | null): string | null {
  if (typeof value !== 'number') {
    return null;
  }

  return currencyFormatter.format(value);
}

function formatDistance(distanceMeters?: number | null): string | null {
  if (typeof distanceMeters !== 'number') {
    return null;
  }

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  const km = distanceMeters / 1000;
  return `${km.toFixed(km >= 10 ? 0 : 1)} km`;
}

function formatRelativeDate(date?: string): string | null {
  if (!date) {
    return null;
  }
  const delta = Date.now() - new Date(date).getTime();
  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    const hours = Math.floor(delta / (1000 * 60 * 60));
    if (hours <= 0) {
      const minutes = Math.floor(delta / (1000 * 60));
      return `${minutes}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days < 30) {
    return `${days}d ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }
  const years = Math.floor(months / 12);
  return `${years}y ago`;
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

function extractMealTags(tags?: MealTags | null): string[] {
  if (!tags) {
    return [];
  }

  const labelMap: Record<keyof MealTags, string> = {
    is_vegan: 'Vegan friendly',
    is_halal: 'Halal options',
    is_vegetarian: 'Vegetarian friendly',
    is_spicy: 'Spicy',
    is_gluten_free: 'Gluten free',
    is_dairy_free: 'Dairy free',
    is_nut_free: 'Nut free',
  };

  return Object.entries(tags)
    .filter((entry): entry is [keyof MealTags, string] => Boolean(entry[1]))
    .filter(([, value]) => value === 'yes')
    .map(([key]) => labelMap[key]);
}

const reviewTagLabels = {
  is_vegan: 'Vegan',
  is_halal: 'Halal',
  is_vegetarian: 'Vegetarian',
  is_spicy: 'Spicy',
  is_gluten_free: 'Gluten free',
  is_dairy_free: 'Dairy free',
  is_nut_free: 'Nut free',
} as const;

type ReviewTagField = keyof typeof reviewTagLabels;

function extractReviewTags(review: ReviewResponse): string[] {
  return (Object.keys(reviewTagLabels) as ReviewTagField[])
    .filter((key) => review[key] === 'yes')
    .map((key) => reviewTagLabels[key]);
}

interface MealAccordionProps {
  meals: MealResponse[];
  reviews: ReviewResponse[];
  expandedMealId: string | null;
  onToggle: (mealId: string) => void;
  onReviewMeal: (payload: { mealId: string; mealName: string }) => void;
}

function MealAccordion({
  meals,
  reviews,
  expandedMealId,
  onToggle,
  onReviewMeal,
}: MealAccordionProps): JSX.Element {
  if (!meals.length) {
    return (
      <Card className="rounded-3xl border-dashed bg-white/80">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <UtensilsCrossed className="size-8 text-muted-foreground" />
          <p className="text-base font-semibold text-foreground">No meals catalogued yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to document a signature dish from this restaurant.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {meals.map((meal) => {
        const isExpanded = expandedMealId === meal.id;
        const mealReviews = reviews.filter((review) => review.meal_id === meal.id);
        const dietaryBadges = extractMealTags(meal.tags);

        return (
          <Card key={meal.id} className="rounded-3xl border border-border/50 bg-white/85 shadow-none">
            <button
              type="button"
              onClick={() => onToggle(meal.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isExpanded}
              aria-controls={`meal-panel-${meal.id}`}
            >
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">{meal.name}</p>
                <p className="text-sm text-muted-foreground">
                  {meal.review_count.toLocaleString()} reviews ·{' '}
                  {formatCurrency(meal.avg_price ?? meal.price) ?? 'Unknown price'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {typeof meal.avg_rating === 'number' ? (
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    <Star className="mr-1 size-3.5 fill-current" />
                    {meal.avg_rating.toFixed(1)}
                  </Badge>
                ) : null}
                <ChevronDown
                  className={`size-4 transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                />
              </div>
            </button>
            {isExpanded ? (
              <div
                id={`meal-panel-${meal.id}`}
                className="border-t border-border/60 px-5 py-4 text-sm text-muted-foreground"
              >
                {dietaryBadges.length ? (
                  <div className="flex flex-wrap gap-2 pb-3">
                    {dietaryBadges.map((badge) => (
                      <Badge
                        key={badge}
                        variant="secondary"
                        className="rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-800"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {mealReviews.length ? (
                  <div className="space-y-4">
                    {mealReviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-border/40 bg-background/60 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-foreground">
                          <span>{review.user.first_name ?? 'Anonymous'}</span>
                          <span className="inline-flex items-center gap-1 text-primary">
                            <Star className="size-3.5 fill-current" />
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                        {review.text ? (
                          <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                          <span>{formatRelativeDate(review.created_at) ?? 'Recently'}</span>
                          {typeof review.price === 'number' ? (
                            <>
                              <Separator orientation="vertical" className="h-3 bg-border/60" />
                              <span>{formatCurrency(review.price)}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No reviews yet for this meal. Share your impression to help others.
                  </p>
                )}
                <Button
                  size="sm"
                  className="mt-4 rounded-full"
                  onClick={() => onReviewMeal({ mealId: meal.id, mealName: meal.name })}
                >
                  Review {meal.name}
                </Button>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

interface ReviewListProps {
  reviews: ReviewResponse[];
}

function ReviewList({ reviews }: ReviewListProps): JSX.Element {
  if (!reviews.length) {
    return (
      <Card className="rounded-3xl border-dashed bg-white/80">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <MessageSquareText className="size-8 text-muted-foreground" />
          <p className="text-base font-semibold text-foreground">No recent feedback yet</p>
          <p className="text-sm text-muted-foreground">
            Once someone shares a review for this place, it will show up here instantly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const badges = extractReviewTags(review);
        return (
          <Card key={review.id} className="rounded-3xl border border-border/40 bg-white/85 shadow-sm">
            <CardContent className="space-y-3 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {review.user.first_name ?? 'Anonymous'}{' '}
                    {review.user.last_name ? review.user.last_name.charAt(0) : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reviewed {formatRelativeDate(review.created_at) ?? 'recently'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Star className="size-3.5 fill-current" />
                  {review.rating.toFixed(1)}
                </div>
              </div>
              <p className="text-sm text-foreground">{review.text ?? 'No written review provided.'}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {typeof review.price === 'number' ? <span>{formatCurrency(review.price)}</span> : null}
                {typeof review.waiting_time_minutes === 'number' ? (
                  <>
                    <Separator orientation="vertical" className="h-3 bg-border/60" />
                    <span>Wait {review.waiting_time_minutes}m</span>
                  </>
                ) : null}
                {badges.length ? (
                  <>
                    <Separator orientation="vertical" className="h-3 bg-border/60" />
                    <div className="flex flex-wrap gap-1.5">
                      {badges.map((badge) => (
                        <Badge key={badge} variant="outline" className="rounded-full px-2 py-0.5 text-[10px]">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function RestaurantDetailsPage(): JSX.Element {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();

  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [quickTags, setQuickTags] = useState<DietaryTag[]>([]);
  const [quickPhotoPreview, setQuickPhotoPreview] = useState<string | null>(null);

  const {
    data: placeDetails,
    isPending: isPlaceLoading,
    error: placeError,
  } = usePlaceDetails({ placeId });
  const { data: mealsPage, isPending: isMealsLoading } = useMeals({
    placeId,
    pageSize: 25,
  });
  const {
    data: reviewsPage,
    isPending: isReviewsLoading,
  } = usePlaceReviews({
    placeId,
    pageSize: 6,
  });

  const meals = mealsPage?.results ?? [];
  const reviews = reviewsPage?.results ?? [];

  const galleryImages = useMemo(() => placeDetails?.images?.slice(0, 4) ?? [], [placeDetails?.images]);
  const heroImage =
    placeDetails?.images?.[0]?.image_url ??
    placeDetails?.first_image?.image_url ??
    galleryImages[0]?.image_url ??
    null;

  const distanceLabel = formatDistance(placeDetails?.distance_meters);
  const cuisineLabel = formatCuisine(placeDetails?.cuisine);

  const handleToggleMeal = useCallback(
    (mealId: string) => {
      setExpandedMealId((current) => (current === mealId ? null : mealId));
    },
    []
  );

  const handleReviewMeal = useCallback(
    ({ mealId, mealName }: { mealId: string; mealName: string }) => {
      navigate('/reviews/new', {
        state: {
          placeId,
          restaurantName: placeDetails?.name,
          mealId,
          mealName,
        },
      });
    },
    [navigate, placeDetails?.name, placeId]
  );

  const handleQuickTagToggle = useCallback(
    (tag: DietaryTag) => {
      setQuickTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
    },
    []
  );

  const handleQuickPhotoUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setQuickPhotoPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setQuickPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleNavigateBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleStartReview = useCallback(() => {
    navigate('/reviews/new', {
      state: {
        placeId,
        restaurantName: placeDetails?.name,
      },
    });
  }, [navigate, placeDetails?.name, placeId]);

  const isLoadingAny = isPlaceLoading || isMealsLoading || isReviewsLoading;

  return (
    <div className="flex flex-1 flex-col">
      <motion.header
        className="flex items-center gap-3 px-4 pb-3 pt-4 sm:px-6 lg:px-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={handleNavigateBack}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Separator orientation="vertical" className="h-6 bg-border/60" />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-muted-foreground">Restaurant details</p>
          <p className="text-base font-semibold text-foreground">{placeDetails?.name ?? 'Loading…'}</p>
        </div>
      </motion.header>

      <main className="flex flex-1 flex-col gap-6 px-4 pb-24 sm:px-6 lg:px-10 lg:pb-16">
        {isLoadingAny ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        ) : placeError ? (
          <Card className="rounded-3xl border border-destructive/40 bg-destructive/10">
            <CardContent className="py-10 text-center">
              <p className="text-base font-semibold text-destructive">Unable to load this restaurant.</p>
              <p className="mt-1 text-sm text-destructive">
                {(placeError as Error).message ?? 'The server did not return any data.'}
              </p>
            </CardContent>
          </Card>
        ) : !placeDetails ? (
          <Card className="rounded-3xl border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              We could not find details for this restaurant.
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm">
              <div className="relative h-[280px] w-full">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={placeDetails.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    <ImageMinus className="size-10" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <div className="flex flex-wrap items-center gap-2 pb-2">
                    {cuisineLabel ? (
                      <Badge className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                        {cuisineLabel}
                      </Badge>
                    ) : null}
                    {distanceLabel ? (
                      <Badge variant="outline" className="rounded-full border-white/60 bg-white/20 text-xs text-white">
                        {distanceLabel}
                      </Badge>
                    ) : null}
                  </div>
                  <h1 className="text-2xl font-semibold">{placeDetails.name}</h1>
                  <p className="text-sm text-white/80">{placeDetails.address ?? 'Address unavailable'}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-4 fill-current text-amber-300" />
                      {(placeDetails.average_rating ?? 0).toFixed(1)}
                    </span>
                    <Separator orientation="vertical" className="h-4 bg-white/40" />
                    <span>{placeDetails.review_count?.toLocaleString() ?? 0} reviews</span>
                  </div>
                </div>
              </div>
              {galleryImages.length ? (
                <div className="grid grid-cols-2 gap-2 border-t border-border/60 bg-background/40 p-4 sm:grid-cols-4">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-2xl border border-border/40">
                      <img
                        src={image.image_url}
                        alt={`${placeDetails.name} gallery`}
                        className="h-32 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="grid gap-4 border-t border-border/60 bg-white/80 p-5 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  {placeDetails.address ?? 'Unknown address'}
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="size-4 text-primary" />
                  {distanceLabel ?? 'Distance unavailable'}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  Updated {formatRelativeDate(placeDetails.updated_at) ?? 'recently'}
                </div>
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="size-4 text-primary" />
                  {placeDetails.image_count} community photos
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div>
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Meals at {placeDetails.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Tap a dish to peek at community notes or start a review.
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10">
                    {meals.length} listed
                  </Badge>
                </div>
                <MealAccordion
                  meals={meals}
                  reviews={reviews}
                  expandedMealId={expandedMealId}
                  onToggle={handleToggleMeal}
                  onReviewMeal={handleReviewMeal}
                />
              </div>
              <Card className="rounded-3xl border border-border/60 bg-white/85 shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Ready to review?</CardTitle>
                  <CardDescription>
                    Reuse your last dietary context and add a quick photo before jumping into the full
                    form.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DietaryTagSelector
                    options={dietaryTagOptions}
                    value={quickTags}
                    onToggle={handleQuickTagToggle}
                  />
                  <PhotoUploadField photoPreview={quickPhotoPreview} onPhotoUpload={handleQuickPhotoUpload} />
                  <Button className="w-full rounded-full" onClick={handleStartReview}>
                    Start review form
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Recent reviews</h2>
                  <p className="text-sm text-muted-foreground">
                    What diners are saying after their latest meals.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" onClick={handleStartReview}>
                  Share your take
                </Button>
              </div>
              <ReviewList reviews={reviews} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
