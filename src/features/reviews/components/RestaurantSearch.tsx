import { useMemo } from "react"
import { Filter, MapPin, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface RestaurantSearchProps {
  value: string
  onChange: (value: string) => void
  onFilterClick?: () => void
}

const trendingFilters = ["Open Now", "High Rated", "Outdoor Seating"]

export function RestaurantSearch({
  value,
  onChange,
  onFilterClick,
}: RestaurantSearchProps): JSX.Element {
  const hasSearchValue = useMemo(() => value.trim().length > 0, [value])

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-white/60 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3 pb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current Location
            </p>
            <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
              <MapPin className="size-4 text-primary" />
              <span>Downtown Neo City</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-border/60 bg-white text-muted-foreground"
            onClick={onFilterClick}
            aria-label="Open filters"
          >
            <Filter className="size-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            placeholder="Search for sushi, burgers, coffee..."
            className="h-12 rounded-full bg-background pl-12 text-sm"
            aria-label="Search for nearby restaurants"
          />
        </div>
      </div>

      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
        data-horizontal-scroll
      >
        {trendingFilters.map((filter) => {
          const isActive = hasSearchValue && value.toLowerCase().includes(filter.toLowerCase())
          return (
            <Button
              key={filter}
              variant={isActive ? "default" : "outline"}
              className="rounded-full border-border/60 bg-white/80 px-4 py-2 text-xs font-medium"
            >
              {filter}
            </Button>
          )
        })}
      </div>
    </section>
  )
}
