import type { MealTags, ReviewResponse } from '@/features/dashboard/types';

const currencyFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

export function formatCurrency(value?: number | null): string | null {
  if (typeof value !== 'number') {
    return null;
  }

  return currencyFormatter.format(value);
}

export function formatDistance(distanceMeters?: number | null): string | null {
  if (typeof distanceMeters !== 'number') {
    return null;
  }

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  const km = distanceMeters / 1000;
  return `${km.toFixed(km >= 10 ? 0 : 1)} km`;
}

export function formatRelativeDate(date?: string): string | null {
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

export function formatCuisine(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  return value
    .split(/[_\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function extractMealTags(tags?: MealTags | null): string[] {
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

export function extractReviewTags(review: ReviewResponse): string[] {
  return (Object.keys(reviewTagLabels) as ReviewTagField[])
    .filter((key) => review[key] === 'yes')
    .map((key) => reviewTagLabels[key]);
}
