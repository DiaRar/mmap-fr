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
  isNew?: boolean;
  isPopular?: boolean;
}
