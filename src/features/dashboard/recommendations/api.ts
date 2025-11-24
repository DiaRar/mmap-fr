import { useMutation } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

export interface SwipePayload {
  meal_id: string;
  liked: boolean;
  session_id: string;
}

type SwipeResponse = Record<string, unknown>;

export function useCreateSwipeMutation() {
  return useMutation({
    mutationFn: async (payload: SwipePayload) =>
      apiRequest<SwipeResponse>('/swipes', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}
