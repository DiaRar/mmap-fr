import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { motion } from 'motion/react';
import { Filter, Loader2, MapPin, Search, LocateFixed } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLocation } from '@/features/dashboard/hooks/useLocation';
import { useLocationLabel } from '@/features/dashboard/hooks/useLocationLabel';
import { useMealmapStore } from '@/features/dashboard/store/useMealmapStore';

export interface RestaurantSearchProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
}

const trendingFilters = ['Open Now', 'High Rated', 'Outdoor Seating'];

export function RestaurantSearch({
  value,
  onChange,
  onFilterClick,
}: RestaurantSearchProps): JSX.Element {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  const setUserLocation = useMealmapStore((state) => state.setUserLocation);
  const setLocationLabel = useMealmapStore((state) => state.setLocationLabel);
  const { userLocation, isLoading, error: locationError, permissionDenied, requestLocation } =
    useLocation();
  const {
    locationLabel,
    isResolving: isResolvingLabel,
    error: reverseGeocodeError,
  } = useLocationLabel();

  useEffect(() => {
    if (!isDialogOpen) {
      setManualError(null);
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (userLocation) {
      setManualLat(userLocation.lat.toFixed(6));
      setManualLng(userLocation.lng.toFixed(6));
    }
  }, [userLocation]);

  const handleFilterClick = useCallback((filter: string) => {
    setActiveFilters((current) => {
      const isActive = current.includes(filter);

      if (isActive) {
        return current.filter((item) => item !== filter);
      }

      return [...current, filter];
    });
  }, []);

  const status = useMemo(() => {
    if (isLoading) {
      return {
        message: 'Detecting location...',
        helper: 'Hang tight while we grab your coordinates.',
        isError: false,
        showSpinner: true,
      };
    }

    if (locationLabel) {
      return {
        message: locationLabel,
        helper: 'Used to personalize your feed.',
        isError: false,
        showSpinner: isResolvingLabel,
      };
    }

    if (userLocation) {
      return {
        message: `${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}`,
        helper: 'Used to personalize your feed.',
        isError: false,
        showSpinner: isResolvingLabel,
      };
    }

    if (permissionDenied) {
      return {
        message: 'Location permission denied',
        helper: 'Set your location manually or enable permissions.',
        isError: true,
        showSpinner: false,
      };
    }

    if (locationError) {
      return {
        message: locationError,
        helper: 'Try again or set your location manually.',
        isError: true,
        showSpinner: false,
      };
    }

    return {
      message: 'Location unavailable',
      helper: 'Set your location to improve recommendations.',
      isError: true,
      showSpinner: false,
    };
  }, [
    isLoading,
    locationLabel,
    userLocation,
    isResolvingLabel,
    permissionDenied,
    locationError,
  ]);

  const helperMessage =
    reverseGeocodeError && status.helper
      ? `${status.helper} (${reverseGeocodeError})`
      : status.helper ?? reverseGeocodeError ?? '';

  const handleManualSave = useCallback(() => {
    const lat = Number(manualLat);
    const lng = Number(manualLng);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setManualError('Latitude must be a number between -90 and 90.');
      return;
    }

    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      setManualError('Longitude must be a number between -180 and 180.');
      return;
    }

    const coords = { lat, lng };

    setUserLocation(coords, { source: 'manual' });
    setLocationLabel(null, null);
    setIsDialogOpen(false);
  }, [manualLat, manualLng, setLocationLabel, setUserLocation]);

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>Set your location</DialogTitle>
            <DialogDescription>
              Choose coordinates manually or retry using your device&apos;s location services.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="manual-lat">Latitude</Label>
                <Input
                  id="manual-lat"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  placeholder="36.3725"
                  value={manualLat}
                  onChange={(event) => setManualLat(event.currentTarget.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="manual-lng">Longitude</Label>
                <Input
                  id="manual-lng"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  placeholder="127.3606"
                  value={manualLng}
                  onChange={(event) => setManualLng(event.currentTarget.value)}
                />
              </div>
            </div>

            {manualError && <p className="text-sm text-destructive">{manualError}</p>}

            <Button
              type="button"
              variant="secondary"
              onClick={requestLocation}
              disabled={isLoading}
              className="justify-start"
            >
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Use current location
            </Button>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleManualSave}>
              Save location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <div className="flex flex-col gap-1" aria-live="polite">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <MapPin className="size-4 text-primary" />
                  <span className={status.isError ? 'text-destructive' : undefined}>
                    {status.message}
                  </span>
                  {status.showSpinner && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                </div>
                {helperMessage && (
                  <p
                    className={`text-xs ${status.isError ? 'text-destructive' : 'text-muted-foreground'}`}
                  >
                    {helperMessage}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full border-border/60 bg-white text-muted-foreground"
                onClick={() => setIsDialogOpen(true)}
                aria-label="Set location manually"
              >
                <LocateFixed className="size-4" />
              </Button>
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

      <ButtonGroup
        className="mx-auto flex max-w-full flex-wrap justify-center gap-2"
        data-horizontal-scroll
      >
        {trendingFilters.map((filter) => {
          const isActive = activeFilters.includes(filter);
          return (
            <motion.div
              key={filter}
              layout
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            >
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={`rounded-full border-border/60 px-4 text-xs font-medium transition-shadow ${isActive ? 'shadow-md shadow-primary/20' : ''}`}
                onClick={() => handleFilterClick(filter)}
                aria-pressed={isActive}
              >
                {filter}
              </Button>
            </motion.div>
          );
        })}
      </ButtonGroup>
      </section>
    </>
  );
}
