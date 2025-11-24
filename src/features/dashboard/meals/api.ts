import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';
import type { MealResponse, ObjectCreationResponse, Page } from '@/features/dashboard/types';

interface UseMealsOptions {
  placeId?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export function useMeals({
  placeId,
  searchTerm,
  page = 1,
  pageSize = 10,
}: UseMealsOptions = {}) {
  return useQuery({
    queryKey: ['meals', placeId ?? 'all', searchTerm ?? '', page, pageSize],
    enabled: Boolean(placeId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (placeId) params.append('place_id', placeId);
      if (searchTerm) params.append('name', searchTerm);
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      return apiRequest<Page<MealResponse>>(`/meals?${params.toString()}`);
    },
  });
}

interface CreateMealInput {
  name: string;
  place_id: string;
  price?: number;
}

export function useCreateMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMealInput) => {
      const body = new URLSearchParams();
      body.append('name', data.name);
      body.append('place_id', data.place_id);
      if (typeof data.price === 'number') {
        body.append('price', data.price.toString());
      }

      return apiRequest<ObjectCreationResponse>('/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meals', variables.place_id] });
    },
  });
}

interface UpdateMealInput {
  meal_id: string;
  price?: number;
  name?: string;
}

export function useUpdateMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meal_id, price, name }: UpdateMealInput) => {
      const body = new URLSearchParams();
      if (typeof price === 'number') {
        body.append('price', price.toString());
      }
      if (name) {
        body.append('name', name);
      }

      return apiRequest('/meals/' + meal_id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meals', variables.meal_id] });
    },
  });
}
