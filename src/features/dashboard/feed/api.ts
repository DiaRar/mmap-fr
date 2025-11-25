import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { ObjectCreationResponse } from '@/features/dashboard/types';

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
