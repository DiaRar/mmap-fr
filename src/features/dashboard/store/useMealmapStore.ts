import { create } from 'zustand';

import type { RecommendationResponse, ReviewDraft, GeoPoint } from '@/features/dashboard/types';

type BookmarkState = Record<string, boolean>;
type RecommendationState = Record<string, RecommendationResponse>;

interface MealmapState {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  bookmarkedIds: BookmarkState;
  toggleBookmark: (restaurantId: string) => void;
  selectedRestaurantId?: string;
  selectRestaurant: (restaurantId?: string) => void;
  recommendationFeedback: RecommendationState;
  markRecommendation: (id: string, response: RecommendationResponse) => void;
  reviewDrafts: ReviewDraft[];
  addReviewDraft: (draft: ReviewDraft) => void;
  userPoints: number;
  addPoints: (points: number) => void;
  userLocation: GeoPoint | null;
  setUserLocation: (location: GeoPoint | null) => void;
}

export const useMealmapStore = create<MealmapState>((set) => ({
  searchTerm: '',
  setSearchTerm: (value) => set({ searchTerm: value }),
  bookmarkedIds: {},
  toggleBookmark: (restaurantId) =>
    set((state) => ({
      bookmarkedIds: {
        ...state.bookmarkedIds,
        [restaurantId]: !state.bookmarkedIds[restaurantId],
      },
    })),
  selectedRestaurantId: undefined,
  selectRestaurant: (restaurantId) => set({ selectedRestaurantId: restaurantId }),
  recommendationFeedback: {},
  markRecommendation: (id, response) =>
    set((state) => ({
      recommendationFeedback: {
        ...state.recommendationFeedback,
        [id]: response,
      },
    })),
  reviewDrafts: [],
  addReviewDraft: (draft) =>
    set((state) => ({
      reviewDrafts: [draft, ...state.reviewDrafts].slice(0, 5),
    })),
  userPoints: 0,
  addPoints: (points) =>
    set((state) => ({
      userPoints: state.userPoints + points,
    })),
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),
}));
