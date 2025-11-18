import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { mockRecommendations, mockRestaurants } from '@/features/dashboard/data/mock-data';
import type { MealRecommendation, NearbyRestaurant } from '@/features/dashboard/types';

const emulateLatency = async <T>(payload: T, delay = 400): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(payload), delay);
  });

const restaurantBounds = (() => {
  const lats = mockRestaurants.map((restaurant) => restaurant.coordinates.lat);
  const lngs = mockRestaurants.map((restaurant) => restaurant.coordinates.lng);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
})();

const fetchRestaurants = async (): Promise<NearbyRestaurant[]> => {
  return emulateLatency(mockRestaurants, 350);
};

const fetchRecommendations = async (): Promise<MealRecommendation[]> => {
  return emulateLatency(mockRecommendations, 420);
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

export function useRecommendationsQuery() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendations,
    staleTime: 1000 * 60 * 15,
  });
}

export { restaurantBounds };
