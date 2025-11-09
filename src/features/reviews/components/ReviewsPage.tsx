import { useMemo, useState } from "react"
import { Sparkles } from "lucide-react"

import { Separator } from "@/components/ui/separator"

import { useNearbyRestaurants } from "@/lib/data/restaurants"
import { AddRestaurantCTA } from "./AddRestaurantCTA"
import { BottomNav } from "./BottomNav"
import { RestaurantList } from "./RestaurantList"
import { RestaurantSearch } from "./RestaurantSearch"

export function ReviewsPage(): JSX.Element {
  const { restaurants } = useNearbyRestaurants()
  const [searchTerm, setSearchTerm] = useState("")
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({})

  const filteredRestaurants = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase()

    if (!needle) {
      return restaurants
    }

    return restaurants.filter((restaurant) => {
      const fields = [
        restaurant.name,
        restaurant.cuisine,
        restaurant.tags.join(" "),
        restaurant.priceRange,
      ]
      return fields.some((field) => field.toLowerCase().includes(needle))
    })
  }, [restaurants, searchTerm])

  const handleBookmark = (restaurantId: string) => {
    setBookmarkedIds((prev) => ({
      ...prev,
      [restaurantId]: !prev[restaurantId],
    }))
  }

  const bookmarkedCount = useMemo(
    () => Object.values(bookmarkedIds).filter(Boolean).length,
    [bookmarkedIds],
  )

  return (
    <>
      <header className="space-y-4 bg-gradient-to-b from-primary/10 to-transparent px-6 pb-4 pt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="size-4" />
          <span>{bookmarkedCount > 0 ? `${bookmarkedCount} saved spots` : "Tailored nearby picks"}</span>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Where should we eat tonight?
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse curated places pulled from the community’s latest reviews.
          </p>
        </div>
        <RestaurantSearch value={searchTerm} onChange={setSearchTerm} />
      </header>

      <section className="flex flex-1 flex-col gap-4 px-6 pb-4 pt-2">
        <RestaurantList
          restaurants={filteredRestaurants}
          onBookmark={handleBookmark}
          bookmarked={bookmarkedIds}
        />
        <Separator className="my-1 bg-border/60" />
        <AddRestaurantCTA />
      </section>

      <footer className="sticky bottom-3 px-6 pb-2">
        <BottomNav />
      </footer>
    </>
  )
}
