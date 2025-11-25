import { create } from 'zustand';

import type { RecommendationResponse, ReviewDraft, GeoPoint } from '@/features/dashboard/types';

const USER_LOCATION_STORAGE_KEY = 'mmap:user-location';
const LOCATION_LABEL_STORAGE_KEY = 'mmap:location-label';

type LocationSource = 'auto' | 'manual';

interface StoredLocationState {
  location: GeoPoint | null;
  source: LocationSource | null;
}

function readStoredLocation(): StoredLocationState {
  if (typeof window === 'undefined') return { location: null, source: null };
  try {
    const raw = window.localStorage.getItem(USER_LOCATION_STORAGE_KEY);
    if (!raw) return { location: null, source: null };
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.lat === 'number' &&
      typeof parsed?.lng === 'number' &&
      (parsed?.source === 'auto' || parsed?.source === 'manual')
    ) {
      return {
        location: { lat: parsed.lat, lng: parsed.lng },
        source: parsed.source,
      };
    }
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
      return {
        location: { lat: parsed.lat, lng: parsed.lng },
        source: 'auto',
      };
    }
    return { location: null, source: null };
  } catch {
    return { location: null, source: null };
  }
}

function persistLocation(location: GeoPoint | null, source: LocationSource | null) {
  if (typeof window === 'undefined') return;
  if (!location || !source) {
    window.localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify({ ...location, source }));
}

interface StoredLabelState {
  label: string | null;
  coords: GeoPoint | null;
}

function readStoredLocationLabel(): StoredLabelState {
  if (typeof window === 'undefined') {
    return { label: null, coords: null };
  }
  try {
    const raw = window.localStorage.getItem(LOCATION_LABEL_STORAGE_KEY);
    if (!raw) return { label: null, coords: null };
    const parsed = JSON.parse(raw);
    const coordsCandidate = parsed?.coords;
    if (
      typeof parsed?.label === 'string' &&
      coordsCandidate &&
      typeof coordsCandidate.lat === 'number' &&
      typeof coordsCandidate.lng === 'number'
    ) {
      return {
        label: parsed.label,
        coords: { lat: coordsCandidate.lat, lng: coordsCandidate.lng },
      };
    }
    return { label: null, coords: null };
  } catch {
    return { label: null, coords: null };
  }
}

function persistLocationLabel(label: string | null, coords: GeoPoint | null) {
  if (typeof window === 'undefined') return;
  if (!label || !coords) {
    window.localStorage.removeItem(LOCATION_LABEL_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(LOCATION_LABEL_STORAGE_KEY, JSON.stringify({ label, coords }));
}

const { location: initialLocation, source: initialLocationSource } = readStoredLocation();
const initialLabelState = readStoredLocationLabel();

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
  userLocationSource: LocationSource | null;
  setUserLocation: (location: GeoPoint | null, options?: { source?: LocationSource }) => void;
  locationLabel: string | null;
  locationLabelCoords: GeoPoint | null;
  setLocationLabel: (label: string | null, coords?: GeoPoint | null) => void;
  swipeSessionId: string | null;
  setSwipeSessionId: (sessionId: string) => void;
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
  userLocation: initialLocation,
  userLocationSource: initialLocationSource,
  setUserLocation: (location, options) => {
    const source: LocationSource | null = location === null ? null : (options?.source ?? 'auto');
    persistLocation(location, source);
    set({ userLocation: location, userLocationSource: source });
  },
  locationLabel: initialLabelState.label,
  locationLabelCoords: initialLabelState.coords,
  setLocationLabel: (label, coords) => {
    const safeCoords = coords ?? null;
    persistLocationLabel(label, safeCoords);
    set({
      locationLabel: label,
      locationLabelCoords: safeCoords,
    });
  },
  swipeSessionId: null,
  setSwipeSessionId: (sessionId) => set({ swipeSessionId: sessionId }),
}));
