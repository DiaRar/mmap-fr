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
