export interface GeoPoint {
  lat: number;
  lng: number;
}

export type DietaryTag =
  | 'Halal'
  | 'Spicy'
  | 'Dairy-free'
  | 'Vegan'
  | 'Vegetarian'
  | 'Gluten-free'
  | 'Nut-free'
  | 'Low-carb';

export interface MealRecommendation {
  id: string;
  restaurantId: string;
  title: string;
  highlight: string;
  description: string;
  distance: string;
  matchScore: number;
  rating: number;
  price: string;
  tags: string[];
  imageUrl: string;
  calories?: number;
  mood?: string;
  is_vegan?: 'yes' | 'no' | 'unspecified';
  is_halal?: 'yes' | 'no' | 'unspecified';
  is_vegetarian?: 'yes' | 'no' | 'unspecified';
  is_spicy?: 'yes' | 'no' | 'unspecified';
  is_gluten_free?: 'yes' | 'no' | 'unspecified';
  is_dairy_free?: 'yes' | 'no' | 'unspecified';
  is_nut_free?: 'yes' | 'no' | 'unspecified';
}

export interface ReviewDraft {
  id: string;
  restaurantId: string;
  restaurantName: string;
  mealName: string;
  price: number;
  currency: string;
  rating: number;
  tags: DietaryTag[];
  review: string;
  createdAt: string;
  photoPreview?: string;
}

export type RecommendationResponse = 'liked' | 'dismissed';

// Auth Types

export interface User {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  test_id: string | null;
}

export interface LoginResponse {
  access_token: string;
  user_id: string;
}

// API Responses

export interface Page<T> {
  results: T[];
  total_items: number;
  total_pages: number;
  current_page: number;
  current_page_size: number;
  start_index?: number;
  end_index?: number;
}

export interface BackendImageResponse {
  id: string;
  image_url: string;
  sequence_index: number;
}

export interface PlaceBasicInfo {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  image_count?: number;
  first_image?: BackendImageResponse;
  distance_meters?: number | null;
  average_rating?: number | null;
  review_count?: number | null;
  cuisine?: string | null;
  test_id?: string | null;
  // Frontend-only enriched data (from mocks or future endpoints)
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  distance?: string;
  etaMinutes?: number;
  imageUrl?: string;
  tags?: string[];
  area?: string;
  coordinates?: GeoPoint;
  dietaryTags?: DietaryTag[];
  lastReviewAt?: string;
  queueEstimateMinutes?: number;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface PlaceDetails extends PlaceBasicInfo {
  image_count: number;
  images: BackendImageResponse[];
  created_at: string;
  updated_at: string;
  distance_meters?: number | null;
  average_rating?: number | null;
  review_count?: number | null;
  test_id?: string | null;
  cuisine?: string | null;
}

export interface UserBasicInfo {
  id: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

export interface ReviewResponse {
  id: string;
  meal_id: string;
  meal_name: string;
  rating: number;
  text?: string;
  waiting_time_minutes?: number;
  price?: number;
  test_id?: string;
  is_vegan: string;
  is_halal: string;
  is_vegetarian: string;
  is_spicy: string;
  is_gluten_free: string;
  is_dairy_free: string;
  is_nut_free: string;
  image_count: number;
  first_image?: BackendImageResponse;
  place: PlaceBasicInfo;
  user: UserBasicInfo;
  created_at: string;
  distance_meters?: number | null;
}

export interface MealTags {
  is_vegan?: string | null;
  is_halal?: string | null;
  is_vegetarian?: string | null;
  is_spicy?: string | null;
  is_gluten_free?: string | null;
  is_dairy_free?: string | null;
  is_nut_free?: string | null;
}

export interface MealResponse {
  id: string;
  name: string;
  place_id: string;
  place_name: string;
  price?: number | null;
  avg_price?: number | null;
  avg_rating?: number | null;
  avg_waiting_time?: number | null;
  review_count: number;
  first_image?: BackendImageResponse;
  distance_meters?: number | null;
  tags?: MealTags;
  is_new: boolean;
  is_popular: boolean;
  test_id?: string | null;
}

export interface MealDetailedResponse extends MealResponse {
  description?: string | null;
  images: BackendImageResponse[];
  avg_price?: number | null;
  avg_waiting_time?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ObjectCreationResponse {
  id: string;
}
