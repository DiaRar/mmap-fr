import { Compass, Heart, Home, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
  { label: "Home", icon: Home, isActive: true },
  { label: "Discover", icon: Compass, isActive: false },
  { label: "Saved", icon: Heart, isActive: false },
  { label: "Profile", icon: UserRound, isActive: false },
]

export function BottomNav(): JSX.Element {
  return (
    <nav
      aria-label="Main navigation"
      className="flex items-center justify-around rounded-full border border-border/60 bg-white/80 px-3 py-2 shadow backdrop-blur"
    >
      {items.map(({ label, icon: Icon, isActive }) => (
        <button
          key={label}
          type="button"
          className="flex flex-col items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-current={isActive ? "page" : undefined}
        >
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-transparent text-muted-foreground"
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
