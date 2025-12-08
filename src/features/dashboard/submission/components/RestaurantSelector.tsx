import { useCallback, useState, useEffect, useRef, type JSX } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Check, ChevronsUpDown, Plus, Store, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { usePlaces } from '@/features/dashboard/data/hooks';
import { useCreatePlace } from '@/features/dashboard/feed/api';
import { useMealmapStore } from '@/features/dashboard/store/useMealmapStore';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { restaurantBounds } from '@/features/dashboard/data/hooks';

function MapCenterPicker({ onCenterChange }: { onCenterChange: (latlng: { lat: number; lng: number }) => void }) {
  const map = useMap();
  // store last reported center and ignore the initial map moveend that fires on mount
  const lastRef = useRef<{ lat: number; lng: number } | null>(null);
  const initializedRef = useRef(false);

  // Only update picked coords when the user finishes moving the map
  useMapEvents({
    moveend() {
      try {
        // Leaflet fires a moveend on initial setView — ignore the first one so opening
        // the picker doesn't immediately trigger a state update.
        if (!initializedRef.current) {
          initializedRef.current = true;
          return;
        }

        const c = map.getCenter();
        const next = { lat: c.lat, lng: c.lng };
        const prev = lastRef.current;
        if (!prev || Math.abs(prev.lat - next.lat) > 1e-6 || Math.abs(prev.lng - next.lng) > 1e-6) {
          lastRef.current = next;
          onCenterChange(next);
        }
      } catch (e) {
        // ignore
      }
    },
  });

  return null;
}

export interface RestaurantSelectorProps {
  value: string;
  onChange: (name: string, id?: string) => void;
  error?: string;
  onAddNew?: (name: string) => void;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export function RestaurantSelector({
  value,
  onChange,
  error,
  onAddNew,
}: RestaurantSelectorProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const debouncedSearch = useDebouncedValue(inputValue, 300);

  const { data: placesPage, isFetching } = usePlaces({ searchTerm: debouncedSearch });
  const places = placesPage?.results || [];

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState('');
  
  const [newPlaceCoords, setNewPlaceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const isMobile = useIsMobile();
  const userLocation = useMealmapStore((state) => state.userLocation);
  const { mutateAsync: createPlace, isPending: isCreatingPlace } = useCreatePlace();

  // If value is set but we don't have the place in the list (because we searched something else),
  // we still want to show the name.
  // Ideally we would fetch the place by ID if we had it, but here we just have name 'value'.
  // We rely on the parent passing name.

  const handleSelect = useCallback(
    (placeName: string, placeId?: string) => {
      onChange(placeName, placeId);
      setOpen(false);
      setIsAddingNew(false);
      setNewRestaurantName('');
    },
    [onChange]
  );

  const handleAddNew = useCallback(async () => {
    const trimmedName = newRestaurantName.trim();
    if (!trimmedName) return;
    // Decide coordinates: explicit picker > user location
    const coords = newPlaceCoords ?? (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null);
    if (!coords) {
      toast.error('Pick a location on the map or share your location before adding a restaurant.');
      return;
    }

    try {
      const created = await createPlace({
        name: trimmedName,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      toast.success('Restaurant added');
      onAddNew?.(trimmedName);
      handleSelect(trimmedName, created.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add restaurant';
      toast.error(message);
    }
  }, [createPlace, newRestaurantName, userLocation, onAddNew, handleSelect]);

  const CommandContent = (
    <>
      <CommandInput
        placeholder="Search restaurants..."
        value={inputValue}
        onValueChange={setInputValue}
      />
      <CommandList>
        {/* We disable local filtering because we do server-side filtering */}
        <CommandEmpty>
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-sm text-muted-foreground">
              {isFetching ? 'Searching...' : 'No restaurant found.'}
            </p>
            {!isAddingNew && !isFetching && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNew(true)}
                className="gap-2"
              >
                <Plus className="size-4" />
                Add new restaurant
              </Button>
            )}
          </div>
        </CommandEmpty>
        {isAddingNew ? (
          <CommandGroup>
            <div className="px-2 py-3">
              <div className="space-y-3">
                <Input
                  placeholder="Restaurant name"
                  value={newRestaurantName}
                  onChange={(e) => setNewRestaurantName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newRestaurantName.trim()) {
                      e.preventDefault();
                      void handleAddNew();
                    }
                  }}
                  autoFocus
                />
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => void handleAddNew()}
                      disabled={!newRestaurantName.trim() || isCreatingPlace}
                      className="flex-1"
                    >
                      {isCreatingPlace ? 'Adding...' : 'Add (use my location)'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewRestaurantName('');
                        setNewPlaceCoords(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Or pick the exact location on the map below.
                  </div>
                  <div className="h-48 rounded-md overflow-hidden border border-border/40 relative">
                    <MapContainer
                      center={userLocation ? [userLocation.lat, userLocation.lng] : [(restaurantBounds.maxLat + restaurantBounds.minLat) / 2, (restaurantBounds.maxLng + restaurantBounds.minLng) / 2]}
                      zoom={15}
                      className="w-full h-full"
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                      <MapCenterPicker onCenterChange={setNewPlaceCoords} />
                    </MapContainer>

                    <div
                      className="absolute inset-0 pointer-events-none flex items-center justify-center"
                      style={{ zIndex: 99999 }}
                      aria-hidden
                    >
                      <div className="flex flex-col items-center -mt-6">
                        <div className="w-12 h-12 flex items-center justify-center -mb-1">
                          <div className="rounded-full bg-white/95 p-2 shadow-lg">
                            <MapPin className="text-primary" size={22} />
                          </div>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse opacity-95 shadow-md" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!newPlaceCoords) {
                          toast.error('Tap the map to pick a location first.');
                          return;
                        }
                        void handleAddNew();
                      }}
                      disabled={isCreatingPlace}
                      className="flex-1"
                    >
                      {isCreatingPlace ? 'Adding...' : 'Add (use picked location)'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setNewPlaceCoords(null)}>
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CommandGroup>
        ) : (
          <CommandGroup>
            {places.map((place) => (
              <CommandItem
                key={place.id}
                value={place.name + '_' + place.id} // Make value unique
                onSelect={() => handleSelect(place.name, place.id)}
                className="flex items-center gap-3"
              >
                <Store className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">{place.name}</div>
                  {/* <div className="text-xs text-muted-foreground">
                    {place.address}
                  </div> */}
                </div>
                <Check
                  className={cn('size-4', value === place.name ? 'opacity-100' : 'opacity-0')}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </>
  );

  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className="w-full justify-between font-normal transition-all hover:border-primary/40 hover:bg-primary/5"
    >
      <span className={cn('truncate', !value && 'text-muted-foreground')}>
        {value ? (
          <div className="flex items-center gap-2">
            <Store className="size-4" />
            <span>{value}</span>
          </div>
        ) : (
          'Select restaurant...'
        )}
      </span>
      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
    </Button>
  );

  if (isMobile) {
    return (
      <Field>
        <FieldLabel>
          <FieldTitle>Restaurant</FieldTitle>
          <FieldDescription>Where did you eat? Include pop-ups or kiosks too.</FieldDescription>
        </FieldLabel>
        <FieldContent>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Select Restaurant</DrawerTitle>
              </DrawerHeader>
              <div className="overflow-hidden px-4 pb-4">
                <Command className="rounded-lg border-0" shouldFilter={false}>
                  {CommandContent}
                </Command>
              </div>
            </DrawerContent>
          </Drawer>
          <FieldError errors={error ? [{ message: error }] : undefined} />
        </FieldContent>
      </Field>
    );
  }

  return (
    <Field>
      <FieldLabel>
        <FieldTitle>Restaurant</FieldTitle>
        <FieldDescription>Where did you eat? Include pop-ups or kiosks too.</FieldDescription>
      </FieldLabel>
      <FieldContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command shouldFilter={false}>{CommandContent}</Command>
          </PopoverContent>
        </Popover>
        <FieldError errors={error ? [{ message: error }] : undefined} />
      </FieldContent>
    </Field>
  );
}
