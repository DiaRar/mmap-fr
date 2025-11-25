import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';
import { useLocation } from '@/features/dashboard/hooks/useLocation';
import type { Page, PlaceDetails, ReviewResponse } from '@/features/dashboard/types';

interface UsePlaceDetailsOptions {
  placeId?: string;
}

export function usePlaceDetails({ placeId }: UsePlaceDetailsOptions) {
  const { userLocation } = useLocation();

  return useQuery({
    queryKey: ['place-details', placeId, userLocation?.lat, userLocation?.lng],
    enabled: Boolean(placeId),
    queryFn: async () => {
      if (!placeId) {
        throw new Error('Missing place id');
      }

      const params = new URLSearchParams();
      if (typeof userLocation?.lat === 'number') {
        params.append('lat', userLocation.lat.toString());
      }
      if (typeof userLocation?.lng === 'number') {
        params.append('long', userLocation.lng.toString());
      }

      const search = params.toString();
      const endpoint = search ? `/places/${placeId}?${search}` : `/places/${placeId}`;

      return apiRequest<PlaceDetails>(endpoint);
    },
  });
}

interface UsePlaceReviewsOptions {
  placeId?: string;
  page?: number;
  pageSize?: number;
}

export function usePlaceReviews({ placeId, page = 1, pageSize = 6 }: UsePlaceReviewsOptions) {
  return useQuery({
    queryKey: ['reviews', 'place', placeId, page, pageSize],
    enabled: Boolean(placeId),
    queryFn: async () => {
      if (!placeId) {
        throw new Error('Missing place id');
      }

      const params = new URLSearchParams();
      params.append('place_id', placeId);
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());

      return apiRequest<Page<ReviewResponse>>(`/reviews?${params.toString()}`);
    },
  });
}
