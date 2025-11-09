import { useMemo, useState, type JSX } from "react";
import { Sparkles } from "lucide-react";

import { BottomNav } from "@/features/navigation/components/BottomNav";
import { Separator } from "@/components/ui/separator";

import { useNearbyRestaurants } from "@/lib/data/restaurants";
import { AddRestaurantCTA } from "../components/AddRestaurantCTA";
import { RestaurantList } from "../components/RestaurantList";
import { RestaurantSearch } from "../components/RestaurantSearch";

export function ReviewsPage(): JSX.Element {
  const { restaurants } = useNearbyRestaurants();
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(
    {}
  );

  const filteredRestaurants = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    if (!needle) {
      return restaurants;
    }

    return restaurants.filter((restaurant) => {
      const fields = [
        restaurant.name,
        restaurant.cuisine,
        restaurant.tags.join(" "),
        restaurant.priceRange,
      ];
      return fields.some((field) => field.toLowerCase().includes(needle));
    });
  }, [restaurants, searchTerm]);

  const handleBookmark = (restaurantId: string) => {
    setBookmarkedIds((prev) => ({
      ...prev,
      [restaurantId]: !prev[restaurantId],
    }));
  };

  const bookmarkedCount = useMemo(
    () => Object.values(bookmarkedIds).filter(Boolean).length,
    [bookmarkedIds]
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 px-5 pb-20 pt-5 sm:px-6 sm:pt-6 lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-10 lg:px-8 lg:pb-10">
        <aside className="order-1 space-y-5 lg:sticky lg:top-6">
          <header className="space-y-5 rounded-3xl border border-border/30 bg-gradient-to-b from-primary/10 via-background/95 to-background px-5 py-5 shadow-md shadow-primary/5 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              <span>
                {bookmarkedCount > 0
                  ? `${bookmarkedCount} saved spots`
                  : "Tailored nearby picks"}
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                Where should we eat tonight?
              </h1>
              <p className="text-sm text-muted-foreground lg:text-base">
                Browse curated places pulled from the community’s latest
                reviews.
              </p>
            </div>
            <RestaurantSearch value={searchTerm} onChange={setSearchTerm} />
          </header>

          <div className="hidden lg:block">
            <AddRestaurantCTA />
          </div>

          <div className="hidden lg:block">
            <BottomNav />
          </div>
        </aside>
        <section className="order-2 flex h-full flex-col gap-4 lg:min-h-[620px]">
          <Separator className="bg-border/60 lg:hidden" />
          <div className="flex flex-1 flex-col rounded-3xl bg-white/75 p-2 backdrop-blur-sm lg:p-3">
            <RestaurantList
              restaurants={filteredRestaurants}
              onBookmark={handleBookmark}
              bookmarked={bookmarkedIds}
            />
          </div>
          <Separator className="bg-border/60 lg:hidden" />
          <div className="lg:hidden">
            <AddRestaurantCTA />
          </div>
        </section>
      </div>

      <footer
        className="sticky bottom-0 px-4 py-3 lg:hidden"
      >
        <div className="flex justify-center">
          <BottomNav />
        </div>
      </footer>
    </div>
  );
}
