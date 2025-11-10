import { Compass, Home, Map, UserRound } from 'lucide-react';
import type { JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Reviews', icon: Home, to: '/' },
  // { label: "Suggest", icon: Sparkles, to: "/suggest" },
  { label: 'Discover', icon: Compass },
  { label: 'Map', icon: Map },
  { label: 'Profile', icon: UserRound },
];

export function BottomNav(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      aria-label="Main navigation"
      className="flex w-full max-w-xl items-center justify-between gap-1 rounded-full border border-border/60 bg-white/85 px-2 py-2 shadow backdrop-blur-sm sm:gap-2 sm:px-3"
    >
      {navItems.map(({ label, icon: Icon, to }) => {
        const isActive = to ? location.pathname === to : false;

        return (
          <button
            key={label}
            type="button"
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:text-xs',
              to ? 'hover:text-foreground' : 'text-muted-foreground/60'
            )}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => (to ? navigate(to) : undefined)}
            disabled={!to}
          >
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-full transition sm:size-10',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-transparent text-muted-foreground'
              )}
            >
              <Icon className="size-4" />
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
