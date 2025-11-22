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

export interface NearbyRestaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  distance: string;
  etaMinutes: number;
  imageUrl: string;
  tags: string[];
  area: string;
  coordinates: GeoPoint;
  dietaryTags?: DietaryTag[];
  lastReviewAt?: string;
  queueEstimateMinutes?: number;
  isNew?: boolean;
  isPopular?: boolean;
}

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
}

export interface BackendImageResponse {
  id: string;
  image_url: string;
  sequence_index: number;
}

export interface PlaceBasicInfo {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  first_image?: BackendImageResponse;
}

export interface UserBasicInfo {
  id: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

export interface ReviewResponse {
  id: string;
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
  distance_meters?: number;
}
