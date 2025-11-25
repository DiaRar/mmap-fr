import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';
import { mockRestaurants } from '@/features/dashboard/data/mock-data';
import type { MealRecommendation, MealResponse, PlaceBasicInfo } from '@/features/dashboard/types';

const emulateLatency = async <T>(payload: T, delay = 400): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(payload), delay);
  });

const restaurantBounds = (() => {
  const lats = mockRestaurants.map((restaurant) => restaurant.latitude);
  const lngs = mockRestaurants.map((restaurant) => restaurant.longitude);

  const safeLats = lats.length ? lats : [0];
  const safeLngs = lngs.length ? lngs : [0];

  return {
    minLat: Math.min(...safeLats),
    maxLat: Math.max(...safeLats),
    minLng: Math.min(...safeLngs),
    maxLng: Math.max(...safeLngs),
  };
})();

const fetchRestaurants = async (): Promise<PlaceBasicInfo[]> => {
  return emulateLatency(mockRestaurants, 350);
};

const priceFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

const dietaryLabelMap: Record<string, string> = {
  is_vegan: 'Vegan',
  is_halal: 'Halal',
  is_vegetarian: 'Vegetarian',
  is_spicy: 'Spicy',
  is_gluten_free: 'Gluten-free',
  is_dairy_free: 'Dairy-free',
  is_nut_free: 'Nut-free',
};

const normalizeTagValue = (value?: string | null): 'yes' | 'no' | 'unspecified' => {
  if (value === 'yes' || value === 'no' || value === 'unspecified') {
    return value;
  }
  return 'unspecified';
};

const formatDistance = (meters?: number | null): string | undefined => {
  if (typeof meters !== 'number' || Number.isNaN(meters)) {
    return undefined;
  }
  if (meters <= 0) {
    return 'Nearby';
  }

  const km = meters / 1000;
  const distanceLabel = km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(meters)} m`;
  const minutes = Math.max(1, Math.round(meters / 80));
  return `${distanceLabel} · ${minutes} min`;
};

const formatPrice = (price?: number | null): string | undefined => {
  if (typeof price !== 'number' || Number.isNaN(price) || price <= 0) {
    return undefined;
  }
  return priceFormatter.format(price);
};

const buildDescription = (meal: MealResponse): string | undefined => {
  const parts: string[] = [];

  if (typeof meal.avg_rating === 'number') {
    parts.push(`${meal.avg_rating.toFixed(1)}★ rating`);
  }
  if (typeof meal.review_count === 'number' && meal.review_count > 0) {
    parts.push(`${meal.review_count} reviews`);
  }
  if (typeof meal.avg_waiting_time === 'number' && meal.avg_waiting_time > 0) {
    parts.push(`${meal.avg_waiting_time}m wait`);
  }

  return parts.length ? parts.join(' • ') : undefined;
};

const extractTags = (meal: MealResponse): string[] => {
  const tags: string[] = [];
  const dietaryTags = meal.tags ?? {};

  Object.entries(dietaryTags).forEach(([key, value]) => {
    if (value === 'yes') {
      const label = dietaryLabelMap[key];
      if (label) {
        tags.push(label);
      }
    }
  });

  if (meal.is_new) {
    tags.push('New');
  }

  if (meal.is_popular) {
    tags.push('Popular');
  }

  return tags;
};

const mapMealResponseToRecommendation = (meal: MealResponse): MealRecommendation => {
  const matchScore =
    typeof meal.avg_rating === 'number'
      ? Math.min(99, Math.max(60, Math.round((meal.avg_rating / 5) * 100)))
      : undefined;

  return {
    id: meal.id,
    restaurantId: meal.place_id,
    restaurantName: meal.place_name,
    title: meal.name ?? 'Featured meal',
    highlight: meal.place_name ? `From ${meal.place_name}` : undefined,
    description: buildDescription(meal),
    distance: formatDistance(meal.distance_meters),
    matchScore,
    rating: meal.avg_rating,
    price: formatPrice(meal.price ?? meal.avg_price),
    tags: extractTags(meal),
    imageUrl: meal.first_image?.image_url,
    calories: undefined,
    mood: undefined,
    is_vegan: normalizeTagValue(meal.tags?.is_vegan),
    is_halal: normalizeTagValue(meal.tags?.is_halal),
    is_vegetarian: normalizeTagValue(meal.tags?.is_vegetarian),
    is_spicy: normalizeTagValue(meal.tags?.is_spicy),
    is_gluten_free: normalizeTagValue(meal.tags?.is_gluten_free),
    is_dairy_free: normalizeTagValue(meal.tags?.is_dairy_free),
    is_nut_free: normalizeTagValue(meal.tags?.is_nut_free),
  };
};

interface FetchRecommendationsOptions {
  limit?: number;
  lat?: number;
  long?: number;
}

export const fetchRecommendations = async (
  options: FetchRecommendationsOptions = {}
): Promise<MealRecommendation[]> => {
  const limit = options.limit ?? 5;
  const params = new URLSearchParams();
  params.append('limit', limit.toString());

  const meals = await apiRequest<MealResponse[]>(`/users/me/feed?${params.toString()}`);
  return meals.map(mapMealResponseToRecommendation);
};

export function useRestaurantsQuery() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRestaurantById(id?: string) {
  const { data } = useRestaurantsQuery();

  return useMemo(() => data?.find((restaurant) => restaurant.id === id), [data, id]);
}

interface UseRecommendationsOptions {
  limit?: number;
  enabled?: boolean;
}

export function useRecommendationsQuery(options: UseRecommendationsOptions = {}) {
  const { limit = 5, enabled = true } = options;

  return useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => fetchRecommendations({ limit }),
    staleTime: 1000 * 60 * 5,
    enabled,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}

export { restaurantBounds };
