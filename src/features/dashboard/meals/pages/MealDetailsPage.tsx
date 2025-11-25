import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, ImageMinus, Sparkles, Star, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

import { useMealDetails, useMealReviews } from '@/features/dashboard/meals/api';
import {
  extractMealTags,
  extractReviewTags,
  formatCurrency,
  formatRelativeDate,
} from '@/features/dashboard/restaurants/utils';
import type { ReviewResponse } from '@/features/dashboard/types';

type ReviewContextState = {
  placeId?: string;
  restaurantName?: string;
  mealName?: string;
};

interface MetricSummary {
  points: number[];
  latest?: number;
  earliest?: number;
  average?: number;
  delta?: number;
}

function buildMetricSummary(
  reviews: ReviewResponse[],
  accessor: (review: ReviewResponse) => number | null | undefined
): MetricSummary {
  const ordered = reviews
    .map((review) => ({
      date: new Date(review.created_at).getTime(),
      value: accessor(review),
    }))
    .filter((entry): entry is { date: number; value: number } => typeof entry.value === 'number')
    .sort((a, b) => a.date - b.date);

  if (!ordered.length) {
    return { points: [] };
  }

  const points = ordered.map((entry) => entry.value);
  const sum = points.reduce((total, value) => total + value, 0);
  return {
    points,
    average: sum / points.length,
    earliest: ordered[0].value,
    latest: ordered[ordered.length - 1].value,
    delta: ordered[ordered.length - 1].value - ordered[0].value,
  };
}

interface TrendSparklineProps {
  points: number[];
  color?: string;
  label?: string;
}

function TrendSparkline({ points, color = '#2563eb', label }: TrendSparklineProps): JSX.Element {
  if (!points.length) {
    return (
      <div className="flex h-16 w-full items-center justify-between text-sm text-muted-foreground">
        <span>{label ?? 'Not enough data yet'}</span>
      </div>
    );
  }

  const width = 200;
  const height = 60;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const denominator = Math.max(points.length - 1, 1);
  const pointString = points
    .map((value, index) => {
      const x = (index / denominator) * width;
      const y = max === min ? height / 2 : height - ((value - min) / (max - min)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-16 w-full"
      role="img"
      aria-label={label ?? 'Sparkline trend'}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pointString}
      />
      {points.length ? (
        <>
          <circle
            cx={0}
            cy={max === min ? height / 2 : height - ((points[0] - min) / (max - min)) * height}
            r={3}
            fill={color}
          />
          <circle
            cx={width}
            cy={
              max === min
                ? height / 2
                : height - ((points[points.length - 1] - min) / (max - min)) * height
            }
            r={3}
            fill={color}
          />
        </>
      ) : null}
    </svg>
  );
}

interface MealReviewListProps {
  reviews: ReviewResponse[];
}

function MealReviewList({ reviews }: MealReviewListProps): JSX.Element {
  if (!reviews.length) {
    return (
      <Card className="rounded-3xl border-dashed bg-white/80">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <Sparkles className="size-8 text-muted-foreground" />
          <p className="text-base font-semibold text-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to tell others how this dish stacks up.
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
          <Card
            key={review.id}
            className="rounded-3xl border border-border/40 bg-white/90 shadow-sm"
          >
            <CardContent className="space-y-3 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {review.user.first_name ?? 'Anonymous'}{' '}
                    {review.user.last_name ? review.user.last_name.charAt(0) : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.place.name} · {formatRelativeDate(review.created_at) ?? 'recently'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Star className="size-3.5 fill-current" />
                  {review.rating.toFixed(1)}
                </div>
              </div>
              <p className="text-sm text-foreground">
                {review.text ?? 'No written review provided.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {typeof review.price === 'number' ? (
                  <span>{formatCurrency(review.price)}</span>
                ) : null}
                {typeof review.waiting_time_minutes === 'number' ? (
                  <>
                    <Separator orientation="vertical" className="h-3 bg-border/60" />
                    <span>Wait {review.waiting_time_minutes}m</span>
                  </>
                ) : null}
                <Separator orientation="vertical" className="h-3 bg-border/60" />
                <span>
                  {review.user.first_name ? `${review.user.first_name}'s take` : 'Community voice'}
                </span>
                {badges.length ? (
                  <>
                    <Separator orientation="vertical" className="h-3 bg-border/60" />
                    <div className="flex flex-wrap gap-1.5">
                      {badges.map((badge) => (
                        <Badge
                          key={badge}
                          variant="outline"
                          className="rounded-full px-2 py-0.5 text-[10px]"
                        >
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

export function MealDetailsPage(): JSX.Element {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const reviewContext = location.state as ReviewContextState | undefined;

  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [aggregatedReviews, setAggregatedReviews] = useState<ReviewResponse[]>([]);
  const [totalReviews, setTotalReviews] = useState<number | null>(null);

  const {
    data: mealDetails,
    isPending: isMealLoading,
    error: mealError,
  } = useMealDetails({ mealId });

  const {
    data: reviewsPage,
    isPending: isInitialReviewsLoading,
    isFetching: isReviewsFetching,
  } = useMealReviews({
    mealId,
    page: currentReviewPage,
    pageSize: 6,
  });

  useEffect(() => {
    setCurrentReviewPage(1);
    setAggregatedReviews([]);
    setTotalReviews(null);
  }, [mealId]);

  useEffect(() => {
    if (!reviewsPage) {
      return;
    }

    setAggregatedReviews((prev) => {
      if (currentReviewPage === 1) {
        return reviewsPage.results;
      }
      const next = new Map(prev.map((review) => [review.id, review]));
      reviewsPage.results.forEach((review) => {
        if (!next.has(review.id)) {
          next.set(review.id, review);
        }
      });
      return Array.from(next.values());
    });
    setTotalReviews(reviewsPage.total_items);
  }, [currentReviewPage, reviewsPage]);

  const priceSummary = useMemo(
    () => buildMetricSummary(aggregatedReviews, (review) => review.price),
    [aggregatedReviews]
  );
  const waitSummary = useMemo(
    () => buildMetricSummary(aggregatedReviews, (review) => review.waiting_time_minutes),
    [aggregatedReviews]
  );

  const dietaryBadges = useMemo(() => extractMealTags(mealDetails?.tags), [mealDetails?.tags]);

  const reviewTagFrequency = useMemo(() => {
    const tally: Record<string, number> = {};
    aggregatedReviews.forEach((review) => {
      extractReviewTags(review).forEach((tag) => {
        tally[tag] = (tally[tag] ?? 0) + 1;
      });
    });
    return Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [aggregatedReviews]);

  const heroImage =
    mealDetails?.images?.[0]?.image_url ??
    mealDetails?.first_image?.image_url ??
    aggregatedReviews.find((review) => Boolean(review.first_image?.image_url))?.first_image
      ?.image_url ??
    null;

  const priceHeadline =
    formatCurrency(priceSummary.latest ?? mealDetails?.avg_price ?? mealDetails?.price ?? null) ??
    'Price not tracked yet';
  const waitHeadline =
    typeof waitSummary.latest === 'number'
      ? `${waitSummary.latest}m latest wait`
      : typeof mealDetails?.avg_waiting_time === 'number'
        ? `${Math.round(mealDetails.avg_waiting_time)}m avg wait`
        : 'No wait data yet';

  const canLoadMore =
    typeof totalReviews === 'number' ? aggregatedReviews.length < totalReviews : false;
  const isLoadingAny = isMealLoading || (isInitialReviewsLoading && !aggregatedReviews.length);

  const handleNavigateBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleStartReview = useCallback(() => {
    if (!mealDetails || !mealId) {
      return;
    }
    navigate('/reviews/new', {
      state: {
        placeId: mealDetails.place_id ?? reviewContext?.placeId,
        restaurantName: mealDetails.place_name ?? reviewContext?.restaurantName,
        mealId,
        mealName: mealDetails.name ?? reviewContext?.mealName,
      },
    });
  }, [mealDetails, mealId, navigate, reviewContext]);

  const handleLoadMoreReviews = useCallback(() => {
    setCurrentReviewPage((prev) => prev + 1);
  }, []);

  const handleViewRestaurant = useCallback(() => {
    if (!mealDetails?.place_id) {
      return;
    }
    navigate(`/restaurants/${mealDetails.place_id}`);
  }, [mealDetails?.place_id, navigate]);

  if (isLoadingAny) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

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
          <p className="text-sm font-semibold text-muted-foreground">Meal details</p>
          <p className="text-base font-semibold text-foreground">
            {mealDetails?.name ?? 'Loading…'}
          </p>
        </div>
      </motion.header>

      <main className="flex flex-1 flex-col gap-6 px-4 pb-24 sm:px-6 lg:px-10 lg:pb-16">
        {mealError ? (
          <Card className="rounded-3xl border border-destructive/40 bg-destructive/10">
            <CardContent className="py-10 text-center">
              <p className="text-base font-semibold text-destructive">Unable to load this meal.</p>
              <p className="mt-1 text-sm text-destructive">
                {(mealError as Error).message ?? 'The server did not return any data.'}
              </p>
            </CardContent>
          </Card>
        ) : !mealDetails ? (
          <Card className="rounded-3xl border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              We could not find any details for this meal.
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm">
              <div className="relative h-[260px] w-full">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={mealDetails.name}
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
                    <Badge className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                      {mealDetails.place_name}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full border-white/60 bg-white/20 text-xs text-white"
                    >
                      {mealDetails.review_count.toLocaleString()} reviews
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-semibold">{mealDetails.name}</h1>
                  <p className="text-sm text-white/80">
                    {mealDetails.description ?? 'No description provided yet.'}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-4 fill-current text-amber-300" />
                      {(mealDetails.avg_rating ?? 0).toFixed(1)}
                    </span>
                    <Separator orientation="vertical" className="h-4 bg-white/40" />
                    <span>{priceHeadline}</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 border-t border-border/60 bg-white/80 p-5 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  {priceHeadline}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  {waitHeadline}
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  {dietaryBadges.length ? `${dietaryBadges.length} dietary signals` : 'No tags yet'}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="size-4 text-primary" />
                  {(mealDetails.avg_rating ?? 0).toFixed(1)} ·{' '}
                  {mealDetails.review_count.toLocaleString()} reviews
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-3xl border border-border/60 bg-white/90 shadow-none lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Price trend</CardTitle>
                  <CardDescription>
                    Track how much diners are paying for this dish over time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <p className="text-2xl font-semibold text-foreground">{priceHeadline}</p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Latest price
                      </p>
                    </div>
                    <Separator orientation="vertical" className="h-10 bg-border/60" />
                    <div>
                      <p className="text-xl font-semibold text-foreground">
                        {priceSummary.average
                          ? (formatCurrency(Math.round(priceSummary.average)) ?? '—')
                          : '—'}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Average
                      </p>
                    </div>
                    <Separator orientation="vertical" className="h-10 bg-border/60" />
                    <div>
                      <p
                        className={`text-xl font-semibold ${priceSummary.delta && priceSummary.delta > 0 ? 'text-rose-500' : 'text-emerald-600'}`}
                      >
                        {typeof priceSummary.delta === 'number' && priceSummary.delta !== 0
                          ? `${priceSummary.delta > 0 ? '+' : '-'}${formatCurrency(Math.abs(priceSummary.delta)) ?? Math.abs(priceSummary.delta).toLocaleString()}`
                          : 'No change'}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Vs first review
                      </p>
                    </div>
                  </div>
                  <TrendSparkline
                    points={priceSummary.points}
                    color="#2563eb"
                    label="Price trend"
                  />
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-border/60 bg-white/90 shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Wait-time history</CardTitle>
                  <CardDescription>
                    Community-reported wait times so you can plan ahead.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold text-foreground">
                        {typeof waitSummary.latest === 'number' ? `${waitSummary.latest} min` : '—'}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Latest report
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        {typeof waitSummary.average === 'number'
                          ? `${Math.round(waitSummary.average)} min`
                          : '—'}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Average
                      </p>
                    </div>
                  </div>
                  <TrendSparkline
                    points={waitSummary.points}
                    color="#a855f7"
                    label="Wait-time trend"
                  />
                  <div className="rounded-2xl bg-muted/40 p-3 text-xs text-muted-foreground">
                    Reports come from diner submissions. Share yours when you finish a review to
                    keep this accurate.
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Review feed</h2>
                    <p className="text-sm text-muted-foreground">
                      Every review here is scoped to {mealDetails.name}.
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10">
                    {aggregatedReviews.length} shown
                    {typeof totalReviews === 'number' ? ` / ${totalReviews}` : ''}
                  </Badge>
                </div>
                <MealReviewList reviews={aggregatedReviews} />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="rounded-full"
                    onClick={handleStartReview}
                    disabled={!mealDetails}
                  >
                    Review this meal
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={handleViewRestaurant}
                    disabled={!mealDetails?.place_id}
                  >
                    View restaurant
                  </Button>
                  {canLoadMore ? (
                    <Button
                      variant="ghost"
                      className="ml-auto rounded-full text-sm text-muted-foreground"
                      onClick={handleLoadMoreReviews}
                      disabled={isReviewsFetching}
                    >
                      {isReviewsFetching ? 'Loading…' : 'Load older reviews'}
                    </Button>
                  ) : null}
                </div>
              </div>
              <Card className="rounded-3xl border border-border/60 bg-white/90 shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Dietary signals</CardTitle>
                  <CardDescription>
                    Tags pulled from confirmed reviews so sensitive eaters can stay informed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dietaryBadges.length ? (
                    <div className="flex flex-wrap gap-2">
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
                  ) : (
                    <p className="text-sm text-muted-foreground">No restaurant-level tags yet.</p>
                  )}
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Most-cited tags
                    </p>
                    {reviewTagFrequency.length ? (
                      <ul className="mt-2 space-y-1 text-sm text-foreground">
                        {reviewTagFrequency.map(([tag, count]) => (
                          <li key={tag} className="flex items-center justify-between">
                            <span>{tag}</span>
                            <span className="text-xs text-muted-foreground">{count} mentions</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Reviewers have not flagged anything yet.
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
                    Add your own dietary callouts when you post a review to improve accuracy for
                    everyone.
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
