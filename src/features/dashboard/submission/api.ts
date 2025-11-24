import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { ObjectCreationResponse } from '@/features/dashboard/types';

export interface CreateReviewData {
  place_id: string;
  meal_id?: string;
  meal_name: string;
  rating: number;
  text?: string;
  price?: number;
  waiting_time_minutes?: number;
  is_vegan?: 'yes' | 'no' | 'unspecified';
  is_halal?: 'yes' | 'no' | 'unspecified';
  is_vegetarian?: 'yes' | 'no' | 'unspecified';
  is_spicy?: 'yes' | 'no' | 'unspecified';
  is_gluten_free?: 'yes' | 'no' | 'unspecified';
  is_dairy_free?: 'yes' | 'no' | 'unspecified';
  is_nut_free?: 'yes' | 'no' | 'unspecified';
  images?: File[];
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const formData = new FormData();
      formData.append('place_id', data.place_id);
      formData.append('meal_name', data.meal_name);
      if (data.meal_id) {
        formData.append('meal_id', data.meal_id);
      }
      formData.append('rating', data.rating.toString());
      
      if (data.text) formData.append('text', data.text);
      if (typeof data.price === 'number') formData.append('price', data.price.toString());
      if (typeof data.waiting_time_minutes === 'number') {
        formData.append('waiting_time_minutes', data.waiting_time_minutes.toString());
      }
      
      // Tags
      if (data.is_vegan) formData.append('is_vegan', data.is_vegan);
      if (data.is_halal) formData.append('is_halal', data.is_halal);
      if (data.is_vegetarian) formData.append('is_vegetarian', data.is_vegetarian);
      if (data.is_spicy) formData.append('is_spicy', data.is_spicy);
      if (data.is_gluten_free) formData.append('is_gluten_free', data.is_gluten_free);
      if (data.is_dairy_free) formData.append('is_dairy_free', data.is_dairy_free);
      if (data.is_nut_free) formData.append('is_nut_free', data.is_nut_free);

      if (data.images) {
        data.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      return apiRequest<ObjectCreationResponse>('/reviews', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      if (variables.place_id) {
        queryClient.invalidateQueries({ queryKey: ['meals', variables.place_id] });
      }
      if (variables.meal_id) {
        queryClient.invalidateQueries({ queryKey: ['reviews', variables.meal_id] });
      }
    },
  });
}
