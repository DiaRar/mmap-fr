import { Compass, Home, Map, UserRound } from "lucide-react"
import type { JSX } from "react"

import { cn } from "@/lib/utils"

const items = [
  { label: "Home", icon: Home, isActive: true },
  { label: "Discover", icon: Compass, isActive: false },
  { label: "Map", icon: Map, isActive: false },
  { label: "Profile", icon: UserRound, isActive: false },
]

export function BottomNav(): JSX.Element {
  return (
    <nav
      aria-label="Main navigation"
      className="flex w-full max-w-xl items-center justify-between gap-1 rounded-full border border-border/60 bg-white/85 px-2 py-2 shadow backdrop-blur-sm sm:gap-2 sm:px-3"
    >
      {items.map(({ label, icon: Icon, isActive }) => (
        <button
          key={label}
          type="button"
          className="flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:text-xs"
          aria-current={isActive ? "page" : undefined}
        >
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-full transition sm:size-10",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-transparent text-muted-foreground",
            )}
          >
            <Icon className="size-4" />
          </span>
          {label}
        </button>
      ))}
    </nav>
  )
}

