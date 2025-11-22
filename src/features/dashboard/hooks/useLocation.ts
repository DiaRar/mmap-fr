import { useEffect, useState } from 'react';
import { useMealmapStore } from '../store/useMealmapStore';
import { toast } from 'sonner';

export function useLocation() {
  const { userLocation, setUserLocation } = useMealmapStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation) return; // Already have location

    setIsLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location', error);
        setError(error.message);
        setIsLoading(false);
        toast.error('Unable to retrieve your location. Defaulting to global feed.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [setUserLocation, userLocation]);

  return { userLocation, isLoading, error };
}

