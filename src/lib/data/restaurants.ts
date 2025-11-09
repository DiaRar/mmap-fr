import { useMemo } from "react"

import type { NearbyRestaurant } from "@/features/reviews/types"

const restaurants: NearbyRestaurant[] = [
  {
    id: "solstice-supper-club",
    name: "Solstice Supper Club",
    cuisine: "Modern American",
    rating: 4.8,
    reviewCount: 312,
    priceRange: "$$$",
    distance: "0.8 mi",
    etaMinutes: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
    tags: ["Chef's table", "Seasonal", "Tasting menu"],
    isPopular: true,
  },
  {
    id: "ember-noodle-house",
    name: "Ember Noodle House",
    cuisine: "Neo-Asian",
    rating: 4.6,
    reviewCount: 589,
    priceRange: "$$",
    distance: "1.1 mi",
    etaMinutes: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
    tags: ["Handmade noodles", "Spicy", "Late night"],
    isPopular: true,
  },
  {
    id: "horizon-coffee-lab",
    name: "Horizon Coffee Lab",
    cuisine: "Coffee & Pastry",
    rating: 4.9,
    reviewCount: 218,
    priceRange: "$",
    distance: "0.3 mi",
    etaMinutes: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80",
    tags: ["Third wave", "Workspace friendly", "Plant-based"],
    isNew: true,
  },
  {
    id: "marina-catch",
    name: "Marina Catch",
    cuisine: "Seafood",
    rating: 4.7,
    reviewCount: 441,
    priceRange: "$$$",
    distance: "1.6 mi",
    etaMinutes: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    tags: ["Waterfront", "Raw bar", "Locally sourced"],
  },
  {
    id: "verde-taqueria",
    name: "Verde Taqueria",
    cuisine: "Modern Mexican",
    rating: 4.5,
    reviewCount: 367,
    priceRange: "$$",
    distance: "0.5 mi",
    etaMinutes: 9,
    imageUrl:
      "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80",
    tags: ["Street food", "Margaritas", "Vegan options"],
  },
]

export function getNearbyRestaurants(): NearbyRestaurant[] {
  return restaurants
}

export function useNearbyRestaurants(): { restaurants: NearbyRestaurant[] } {
  return useMemo(
    () => ({
      restaurants,
    }),
    [],
  )
}

export { restaurants }
