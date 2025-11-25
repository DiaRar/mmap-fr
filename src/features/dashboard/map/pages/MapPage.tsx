import type { JSX } from 'react';
import { MapPin, Navigation, Sparkles, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

import { restaurantBounds, useRestaurantsQuery } from '@/features/dashboard/data/hooks';
import { useMealmapStore } from '@/features/dashboard/store/useMealmapStore';
import type { PlaceBasicInfo } from '@/features/dashboard/types';

const LABEL_MAX_W_CLASS = 'max-w-[160px]';
const LABEL_TOP_CLASS = '-top-6';
const MARKER_SIZE_CLASS = 'w-14 h-14';
const PIN_SVG_SIZE = 20;
const MIN_FIT_ZOOM = 12;

export function truncate(s?: string, n = 30) {
  if (!s) return '';
  return s.length > n ? `${s.slice(0, n - 3)}...` : s;
}

const _reverseGeocodeCache = new Map<string, string | null>();
async function reverseGeocodeRoad(lat: number, lon: number): Promise<string | null> {
  const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;
  if (_reverseGeocodeCache.has(key)) return _reverseGeocodeCache.get(key) ?? null;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      String(lat)
    )}&lon=${encodeURIComponent(String(lon))}&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) {
      _reverseGeocodeCache.set(key, null);
      return null;
    }
    const data = await res.json();
    const addr = data?.address ?? {};
    // prefer road, pedestrian, footway, avenue, street, etc.
    const road =
      addr.road ||
      addr.pedestrian ||
      addr.footway ||
      addr.cycleway ||
      addr.neighbourhood ||
      addr.suburb ||
      addr.village ||
      addr.town ||
      addr.city ||
      null;
    _reverseGeocodeCache.set(key, road);
    return road;
  } catch (e) {
    _reverseGeocodeCache.set(key, null);
    return null;
  }
}

function SetUserLocation({
  fallback = [
    (restaurantBounds.maxLat + restaurantBounds.minLat) / 2,
    (restaurantBounds.maxLng + restaurantBounds.minLng) / 2,
  ] as [number, number],
  onFound,
}: {
  fallback?: [number, number];
  onFound?: (latlng: [number, number]) => void;
}): JSX.Element | null {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    if (!navigator.geolocation) {
      map.setView(fallback, 13);
      initialized.current = true;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (initialized.current) return;
        const center: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        map.setView(center);
        initialized.current = true;
        onFound?.(center);
      },
      () => {
        if (initialized.current) return;
        map.setView(fallback, 13);
        initialized.current = true;
      }
    );
  }, [map, fallback, onFound]);
  return null;
}

// Renders markers that change size or hide depending on zoom level
function ZoomResponsiveMarkers({
  restaurants,
  selectedRestaurantId,
  selectRestaurant,
  hideBelow = 11,
  smallBelow = 13,
}: {
  restaurants: PlaceBasicInfo[];
  selectedRestaurantId?: string | number | null;
  selectRestaurant: (id?: any) => void;
  hideBelow?: number;
  smallBelow?: number;
}): JSX.Element | null {
  const map = useMap();
  const [zoom, setZoom] = useState<number>(() => map.getZoom?.() ?? 0);

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    return () => {
      map.off('zoomend', onZoom);
    };
  }, [map]);

  if (!restaurants || restaurants.length === 0) return null;

  // If the zoom is below hideBelow, don't render any markers
  if (zoom < hideBelow) return null;

  const isSmall = zoom < smallBelow;

  return (
    <>
      {restaurants.map((restaurant) => {
        const lat = restaurant.coordinates?.lat ?? restaurant.latitude;
        const lng = restaurant.coordinates?.lng ?? restaurant.longitude;
        const isActive = restaurant.id === selectedRestaurantId;

        const pinSize = isSmall ? Math.max(12, Math.floor(PIN_SVG_SIZE * 0.7)) : PIN_SVG_SIZE;
        const markerSizeClass = isSmall ? 'w-10 h-10' : MARKER_SIZE_CLASS;
        const labelMaxWClass = isSmall ? 'max-w-[100px]' : LABEL_MAX_W_CLASS;

        const pinSvg = renderToStaticMarkup(<MapPin size={pinSize} />);

        const html = `
          <div class="group">
            <div class="group relative inline-flex flex-col items-center">
              <div class="absolute ${LABEL_TOP_CLASS} left-1/2 -translate-x-1/2">
                <div class="flex items-center gap-2 rounded-full border border-border/40 bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow backdrop-blur whitespace-nowrap overflow-hidden">
                  <span class="inline-block ${labelMaxWClass} truncate">${restaurant.name ?? 'Nearby'}</span>
                  <span class="ml-1 flex-shrink-0">${(restaurant.rating ?? restaurant.average_rating ?? 0).toFixed(1)}</span>
                </div>
              </div>
              <div class="mt-2 flex ${markerSizeClass} items-center justify-center rounded-full border-2 shadow ${isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-white/70 bg-white text-primary'}">
                ${pinSvg}
              </div>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html,
          iconSize: [isSmall ? 56 : 80, isSmall ? 56 : 80],
          iconAnchor: [isSmall ? 28 : 40, isSmall ? 28 : 40],
        });

        return (
          <Marker
            key={restaurant.id}
            position={[lat, lng]}
            icon={icon}
            eventHandlers={{ click: () => selectRestaurant(restaurant.id) }}
          />
        );
      })}
    </>
  );
}

function FitBounds({
  restaurants,
  userLocation,
}: {
  restaurants: PlaceBasicInfo[];
  userLocation?: [number, number] | null;
}): JSX.Element | null {
  const map = useMap();

  useEffect(() => {
    if ((!restaurants || restaurants.length === 0) && userLocation) {
      map.setView(userLocation, MIN_FIT_ZOOM);
      const t = setTimeout(() => map.invalidateSize(), 0);
      return () => clearTimeout(t);
    }

    if (!restaurants || restaurants.length === 0) return;

    const bounds = restaurants.map((r) => [
      r.coordinates?.lat ?? r.latitude,
      r.coordinates?.lng ?? r.longitude,
    ]) as [number, number][];

    if (userLocation) bounds.push(userLocation);

    try {
      const targetZoom = map.getBoundsZoom(bounds as any, false);
      if (typeof targetZoom === 'number' && targetZoom < MIN_FIT_ZOOM) {
        const centerLat = (restaurantBounds.maxLat + restaurantBounds.minLat) / 2;
        const centerLng = (restaurantBounds.maxLng + restaurantBounds.minLng) / 2;
        map.setView([centerLat, centerLng], MIN_FIT_ZOOM);
      } else {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch (e) {
      // ignore
    }

    const t = setTimeout(() => map.invalidateSize(), 0);
    return () => clearTimeout(t);
  }, [map, restaurants, userLocation]);

  return null;
}

function formatRelativeReview(date?: string) {
  if (!date) {
    return null;
  }

  const deltaMs = Date.now() - new Date(date).getTime();
  const hours = Math.floor(deltaMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function MapPage(): JSX.Element {
  const { data: restaurants = [], isPending } = useRestaurantsQuery();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const selectedRestaurantId = useMealmapStore((state) => state.selectedRestaurantId);
  const [selectedRoad, setSelectedRoad] = useState<string | null>(null);
  const selectRestaurant = useMealmapStore((state) => state.selectRestaurant);
  const navigate = useNavigate();

  const selectedRestaurant =
    restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? restaurants[0];

  useEffect(() => {
    let mounted = true;
    setSelectedRoad(null);
    if (!selectedRestaurant) return;
    const lat = selectedRestaurant.coordinates?.lat ?? selectedRestaurant.latitude;
    const lng = selectedRestaurant.coordinates?.lng ?? selectedRestaurant.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    reverseGeocodeRoad(lat, lng).then((road) => {
      if (!mounted) return;
      setSelectedRoad(road);
    });
    return () => {
      mounted = false;
    };
  }, [selectedRestaurant]);

  return (
    <div className="flex flex-1 flex-col">
      <motion.header
        className="flex flex-col gap-3 px-5 pb-4 pt-6 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="size-4" />
          Live heatmap
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
            Find nearby kitchens
          </h1>
          <p className="text-sm text-muted-foreground">
            Tap a marker to see community intel, wait times, and quick links to leave a review.
          </p>
        </div>
      </motion.header>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-24 sm:px-6 lg:px-8 lg:pb-16">
        <motion.section
          className="space-y-4 rounded-3xl border border-border/40 bg-background/80 p-4 shadow-sm shadow-primary/5 backdrop-blur"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
        >
          <div className="relative h-[420px] overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-secondary/40">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:140px_140px] opacity-60" />
            {isPending ? (
              <div className="flex h-full items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <MapContainer
                center={[
                  (restaurantBounds.maxLat + restaurantBounds.minLat) / 2,
                  (restaurantBounds.maxLng + restaurantBounds.minLng) / 2,
                ]}
                zoom={13}
                className="w-full h-full"
                style={{ borderRadius: '1rem' }}
              >
                <SetUserLocation
                  fallback={[
                    (restaurantBounds.maxLat + restaurantBounds.minLat) / 2,
                    (restaurantBounds.maxLng + restaurantBounds.minLng) / 2,
                  ]}
                  onFound={(latlng) => setUserLocation((prev) => prev ?? latlng)}
                />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution={
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                  }
                  subdomains={['a', 'b', 'c', 'd']}
                  maxZoom={19}
                />
                <FitBounds restaurants={restaurants} userLocation={userLocation} />

                <ZoomResponsiveMarkers
                  restaurants={restaurants}
                  selectedRestaurantId={selectedRestaurant?.id}
                  selectRestaurant={selectRestaurant}
                  hideBelow={13}
                  smallBelow={16}
                />
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={L.divIcon({
                      className: 'user-location-icon',
                      html: '<div class="w-6 h-6 rounded-full bg-primary border-2 border-white shadow" />',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })}
                  />
                )}
              </MapContainer>
            )}
          </div>

          <Separator />

          <Card className="border-none bg-transparent p-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {selectedRestaurant?.name ?? 'Pick a marker'}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {selectedRestaurant
                      ? `${selectedRestaurant.cuisine ?? 'Restaurant'} · ${selectedRestaurant.distance ?? formatRelativeReview(selectedRestaurant.lastReviewAt) ?? 'nearby'}`
                      : 'Tap a hotspot to see quick facts'}
                  </CardDescription>
                </div>
                {selectedRestaurant ? (
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {selectedRestaurant.priceRange ?? '—'}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-0 pb-0">
              {selectedRestaurant ? (
                <>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-5" />
                      {selectedRestaurant.area ?? 'Address not available'}
                      {selectedRoad ? `, ${selectedRoad}` : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Navigation className="size-4 text-primary" />
                      {selectedRestaurant.etaMinutes ?? '—'} min walk
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4 text-primary" />
                      Wait time: {selectedRestaurant.queueEstimateMinutes ?? 10} min
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="size-4 text-primary" />
                      {formatRelativeReview(selectedRestaurant.lastReviewAt) ?? 'No recent reviews'}
                    </span>
                  </div>
                  {[...(selectedRestaurant.tags ?? []), ...(selectedRestaurant.dietaryTags ?? [])]
                    .length ? (
                    <div className="flex flex-wrap gap-2">
                      {[
                        ...(selectedRestaurant.tags ?? []),
                        ...(selectedRestaurant.dietaryTags ?? []),
                      ].map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="flex-1 rounded-full"
                      onClick={() => selectRestaurant(undefined)}
                      type="button"
                      variant="secondary"
                    >
                      Browse other pins
                    </Button>
                    <Button
                      className="flex-1 rounded-full"
                      onClick={() => navigate('/')}
                      type="button"
                    >
                      View reviews
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Markers highlight the most-reviewed restaurants around KAIST. Each tap reveals
                  walk time, current vibe, and dietary context pulled from the latest community
                  posts.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  );
}
