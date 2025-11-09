import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { NearbyRestaurant } from "../../types"
import { RestaurantList } from "../RestaurantList"

const mockRestaurants: NearbyRestaurant[] = [
  {
    id: "test-bistro",
    name: "Test Bistro",
    cuisine: "Fusion",
    rating: 4.2,
    reviewCount: 128,
    priceRange: "$$",
    distance: "0.4 mi",
    etaMinutes: 8,
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80",
    tags: ["Cozy", "Small plates"],
  },
  {
    id: "lumen-cafe",
    name: "Lumen Cafe",
    cuisine: "Coffee",
    rating: 4.8,
    reviewCount: 289,
    priceRange: "$",
    distance: "0.2 mi",
    etaMinutes: 4,
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    tags: ["Workspace", "Bakery"],
  },
]

describe("<RestaurantList />", () => {
  it("renders a card for each restaurant", () => {
    render(<RestaurantList restaurants={mockRestaurants} />)

    mockRestaurants.forEach((restaurant) => {
      expect(screen.getByText(restaurant.name)).toBeVisible()
      expect(screen.getByText(restaurant.cuisine, { exact: false })).toBeVisible()
    })
  })

  it("invokes onBookmark when a restaurant is bookmarked", async () => {
    const user = userEvent.setup()
    const handleBookmark = vi.fn()
    render(<RestaurantList restaurants={mockRestaurants} onBookmark={handleBookmark} />)

    const bookmarkButtons = screen.getAllByRole("button", { name: /bookmark/i })
    await user.click(bookmarkButtons[0])

    expect(handleBookmark).toHaveBeenCalledWith(mockRestaurants[0].id)
  })

  it("renders an empty state when no restaurants are available", () => {
    render(<RestaurantList restaurants={[]} />)

    expect(screen.getByText("No restaurants found")).toBeVisible()
    expect(
      screen.getByText(/Try updating your search or filters/i),
    ).toBeVisible()
  })
})
