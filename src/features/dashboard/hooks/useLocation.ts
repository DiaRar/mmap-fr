import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useMealmapStore } from '../store/useMealmapStore';

export function useLocation() {
  const userLocation = useMealmapStore((state) => state.userLocation);
  const userLocationSource = useMealmapStore((state) => state.userLocationSource);
  const setUserLocation = useMealmapStore((state) => state.setUserLocation);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const hasRequestedRef = useRef(false);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setPermissionDenied(true);
      return;
    }

    setIsLoading(true);
    setPermissionDenied(false);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          { source: 'auto' }
        );
        setIsLoading(false);
        setError(null);
      },
      (geoError) => {
        console.error('Error getting location', geoError);
        const denied = geoError.code === geoError.PERMISSION_DENIED;
        setPermissionDenied(denied);
        setError(denied ? 'Location permission denied' : geoError.message);
        setIsLoading(false);
        toast.error(
          denied
            ? 'Location permissions denied. Use "Set location" to pick a spot manually.'
            : 'Unable to retrieve your location. Defaulting to global feed.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [setUserLocation]);

  useEffect(() => {
    if (userLocationSource === 'manual') {
      setIsLoading(false);
      return;
    }

    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    requestLocation();
  }, [requestLocation, userLocationSource]);

  return {
    userLocation,
    isLoading,
    error,
    permissionDenied,
    requestLocation,
  };
}
