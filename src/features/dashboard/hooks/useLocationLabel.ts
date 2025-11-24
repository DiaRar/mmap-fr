import { useEffect, useMemo, useState } from 'react';

import type { GeoPoint } from '@/features/dashboard/types';
import { useMealmapStore } from '@/features/dashboard/store/useMealmapStore';
import { reverseGeocode } from '@/features/dashboard/utils/reverseGeocode';

const PRECISION = 4;

function haveSameCoordinates(a?: GeoPoint | null, b?: GeoPoint | null) {
  if (!a || !b) return false;
  return (
    Number(a.lat.toFixed(PRECISION)) === Number(b.lat.toFixed(PRECISION)) &&
    Number(a.lng.toFixed(PRECISION)) === Number(b.lng.toFixed(PRECISION))
  );
}

export function useLocationLabel(target?: GeoPoint | null) {
  const userLocation = useMealmapStore((state) => state.userLocation);
  const locationLabel = useMealmapStore((state) => state.locationLabel);
  const locationLabelCoords = useMealmapStore((state) => state.locationLabelCoords);
  const setLocationLabel = useMealmapStore((state) => state.setLocationLabel);

  const coordinates = target ?? userLocation;
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cachedLabel = useMemo(() => {
    if (!coordinates) return null;
    if (!locationLabel || !locationLabelCoords) return null;
    return haveSameCoordinates(coordinates, locationLabelCoords) ? locationLabel : null;
  }, [coordinates, locationLabel, locationLabelCoords]);

  useEffect(() => {
    if (!coordinates) return;
    if (cachedLabel) return;

    let cancelled = false;
    setIsResolving(true);
    setError(null);

    reverseGeocode(coordinates)
      .then((label) => {
        if (cancelled) return;
        setLocationLabel(label, coordinates);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unable to resolve your location');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsResolving(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cachedLabel, coordinates, coordinates?.lat, coordinates?.lng, setLocationLabel]);

  return {
    locationLabel: cachedLabel,
    isResolving,
    error,
  };
}
