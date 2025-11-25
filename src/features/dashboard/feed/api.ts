import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { ObjectCreationResponse, Page, PlaceBasicInfo } from '@/features/dashboard/types';
import { useLocation } from '@/features/dashboard/hooks/useLocation';

interface UsePlacesOptions {
  lat?: number;
  lng?: number;
  radius_m?: number;
  page?: number;
  size?: number;
  searchTerm?: string;
}

export function usePlaces(options: UsePlacesOptions = {}) {
  const { userLocation } = useLocation();

  // Use provided coords or user location
  const lat = options.lat ?? userLocation?.lat ?? 0;
  const lng = options.lng ?? userLocation?.lng ?? 0;

  const queryKey = ['places', { ...options, lat, lng }];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (lat !== undefined && lat !== null) params.append('lat', lat.toString());
      if (lng !== undefined && lng !== null) params.append('long', lng.toString());
      if (options.radius_m) params.append('radius_meters', options.radius_m.toString());
      if (options.page) params.append('page', options.page.toString());
      if (options.size) params.append('page_size', options.size.toString());

      if (options.searchTerm) {
        params.append('name', options.searchTerm);
      }

      params.append('sort_by', 'distance');
      params.append('sort_order', 'asc');

      return apiRequest<Page<PlaceBasicInfo>>(`/places?${params.toString()}`);
    },
    enabled: true,
  });
}

// export function usePlaces(searchTerm: string) {
//     return useQuery({
//         queryKey: ['places', searchTerm],
//         queryFn: async () => {
//             const params = new URLSearchParams();
//             params.append('name', searchTerm);
//             params.append('lat', '0'); // Required by backend
//             params.append('long', '0'); // Required by backend
//             return apiRequest<Page<{ id: string; name: string }>>(`/places?${params.toString()}`);
//         },
//         enabled: searchTerm.length > 0,
//     });
// }

interface CreatePlaceInput {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  cuisine?: string;
  images?: File[];
}

export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlaceInput) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('latitude', data.latitude.toString());
      formData.append('longitude', data.longitude.toString());
      if (data.address) formData.append('address', data.address);
      if (data.cuisine) formData.append('cuisine', data.cuisine);
      if (data.images) {
        data.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      return apiRequest<ObjectCreationResponse>('/places', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });
}
