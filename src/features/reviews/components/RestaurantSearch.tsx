import { useCallback, useState, type JSX } from "react"
import { motion } from "framer-motion"
import { Filter, MapPin, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ButtonGroup } from "@/components/ui/button-group"

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
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const handleFilterClick = useCallback((filter: string) => {
    setActiveFilters((current) => {
      const isActive = current.includes(filter)

      if (isActive) {
        return current.filter((item) => item !== filter)
      }

      return [...current, filter]
    })
  }, [])

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-white/60 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="space-y-1">
            <Badge
              variant="outline"
              className="w-fit rounded-full border-border/70 bg-muted/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Current Location
            </Badge>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <MapPin className="size-4 text-primary" />
              <span>KAIST W8, 3rd floor, Daejeon</span>
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

      <ButtonGroup className="mx-auto flex max-w-full flex-wrap justify-center gap-2" data-horizontal-scroll>
        {trendingFilters.map((filter) => {
          const isActive = activeFilters.includes(filter)
          return (
            <motion.div
              key={filter}
              layout
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
            >
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`rounded-full border-border/60 px-4 text-xs font-medium transition-shadow ${isActive ? "shadow-md shadow-primary/20" : ""}`}
                onClick={() => handleFilterClick(filter)}
                aria-pressed={isActive}
              >
                {filter}
              </Button>
            </motion.div>
          )
        })}
      </ButtonGroup>
    </section>
  )
}
