import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Page, ReviewResponse } from '@/features/dashboard/types';
import { useLocation } from '@/features/dashboard/hooks/useLocation';

interface UseReviewsOptions {
  lat?: number;
  lng?: number;
  radius_m?: number;
  page?: number;
  size?: number;
  searchTerm?: string;
}

export function useReviews(options: UseReviewsOptions = {}) {
  const { userLocation } = useLocation();
  
  // Use provided coords or user location
  const lat = options.lat ?? userLocation?.lat;
  const lng = options.lng ?? userLocation?.lng;

  const queryKey = ['reviews', { ...options, lat, lng }];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (lat !== undefined && lat !== null) params.append('lat', lat.toString());
      if (lng !== undefined && lng !== null) params.append('long', lng.toString());
      if (options.radius_m) params.append('radius_m', options.radius_m.toString());
      if (options.page) params.append('page', options.page.toString());
      if (options.size) params.append('size', options.size.toString());

      if (options.searchTerm) {
        params.append('meal_name', options.searchTerm);
      }

      params.append('sort_by', 'created_at');
      params.append('sort_order', 'desc');

      return apiRequest<Page<ReviewResponse>>(`/reviews?${params.toString()}`);
    },
    enabled: true,
  });
}

export function usePlaces(searchTerm: string) {
    return useQuery({
        queryKey: ['places', searchTerm],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('name', searchTerm);
            params.append('lat', '0'); // Required by backend
            params.append('long', '0'); // Required by backend
            return apiRequest<Page<{ id: string; name: string }>>(`/places?${params.toString()}`);
        },
        enabled: searchTerm.length > 0,
    });
}
