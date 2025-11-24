import { useMemo, type JSX } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';

import { useMealmapStore } from '@/features/dashboard/store/useMealmapStore';
import { useLocation } from '@/features/dashboard/hooks/useLocation';
import { usePlaces } from '../api';
import { AddRestaurantCTA } from '../components/AddRestaurantCTA';
import { RestaurantList } from '../components/RestaurantList';
import { RestaurantSearch } from '../components/RestaurantSearch';

const quickInsights = [
  { label: 'Saved spots', value: '12' },
  { label: 'Halal nearby', value: '4' },
  { label: 'Wait-time under 10m', value: '6' },
  { label: 'New this week', value: '2' },
];

export function FeedPage(): JSX.Element {
  const navigate = useNavigate();
  useLocation();
  
  const searchTerm = useMealmapStore((state) => state.searchTerm);
  const setSearchTerm = useMealmapStore((state) => state.setSearchTerm);
  const bookmarkedIds = useMealmapStore((state) => state.bookmarkedIds);
  
  const { data: placesPage, isPending } = usePlaces({
    searchTerm: searchTerm,
    // radius_m: 5000 // Optional: limit to 5km if location available
  });

  const bookmarkedCount = useMemo(
    () => Object.values(bookmarkedIds).filter(Boolean).length,
    [bookmarkedIds]
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 px-4 pb-24 pt-5 sm:px-6 sm:pt-6 lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-10 lg:px-8 lg:pb-16">
        <motion.aside
          className="order-1 space-y-5 lg:sticky lg:top-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <header className="space-y-5 rounded-3xl border border-border/30 bg-gradient-to-b from-primary/10 via-background/95 to-background px-5 py-5 shadow-md shadow-primary/5 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              <span>
                {bookmarkedCount > 0 ? `${bookmarkedCount} saved spots` : 'Tailored nearby picks'}
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                Where should we eat tonight?
              </h1>
              <p className="text-sm text-muted-foreground lg:text-base">
                Browse curated places pulled from the community’s latest reviews.
              </p>
            </div>
            <RestaurantSearch value={searchTerm} onChange={setSearchTerm} />
            <div className="grid grid-cols-2 gap-2 pt-2 text-sm sm:grid-cols-4">
              {quickInsights.map((item) => (
                <Card
                  key={item.label}
                  className="border-border/60 bg-white/70 shadow-none backdrop-blur-sm"
                >
                  <CardContent className="flex flex-col gap-1 px-3 py-3">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="text-lg font-semibold text-foreground">{item.value}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </header>

          <div className="hidden lg:block">
            <AddRestaurantCTA onAddClick={() => navigate('/reviews/new')} />
          </div>
        </motion.aside>
        <motion.section
          className="order-2 flex h-full flex-col gap-4 lg:min-h-[620px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        >
          <Separator className="bg-border/60 lg:hidden" />
          <div className="flex flex-1 flex-col rounded-3xl bg-white/75 p-2 backdrop-blur-sm lg:p-3">
            {isPending ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <Spinner />
              </div>
            ) : (
              <RestaurantList restaurants={placesPage?.results || []} />
            )}
          </div>
          <Separator className="bg-border/60 lg:hidden" />
          <div className="lg:hidden">
            <AddRestaurantCTA onAddClick={() => navigate('/reviews/new')} />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
