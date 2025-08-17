import { useState, useEffect } from 'react';
import { LocationData } from '../types';

interface UseLocationOptions {
  autoDetect?: boolean;
  onLocationChange?: (location: LocationData | null) => void;
}

interface UseLocationReturn {
  location: LocationData | null;
  isDetecting: boolean;
  error: string | null;
  setLocation: (location: LocationData | null) => void;
  detectCurrentLocation: () => void;
  clearLocation: () => void;
}

// India bounds for validation
const INDIA_BOUNDS = {
  north: 37.5,
  south: 6.5,
  east: 97.5,
  west: 68.0
};

export const useLocation = (options: UseLocationOptions = {}): UseLocationReturn => {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { autoDetect = false, onLocationChange } = options;

  const isWithinIndiaBounds = (lat: number, lng: number): boolean => {
    return (
      lat >= INDIA_BOUNDS.south &&
      lat <= INDIA_BOUNDS.north &&
      lng >= INDIA_BOUNDS.west &&
      lng <= INDIA_BOUNDS.east
    );
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<LocationData> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      const address = data.address || {};
      
      return {
        latitude: lat,
        longitude: lng,
        address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: address.city || address.town || address.village || address.municipality || '',
        state: address.state || '',
        country: address.country || '',
        district: address.state_district || address.district || '',
        pincode: address.postcode || ''
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: '',
        state: '',
        country: 'India',
        district: '',
        pincode: ''
      };
    }
  };

  const setLocation = (newLocation: LocationData | null) => {
    setLocationState(newLocation);
    if (onLocationChange) {
      onLocationChange(newLocation);
    }
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        if (!isWithinIndiaBounds(latitude, longitude)) {
          setError('Your current location appears to be outside India');
          setIsDetecting(false);
          return;
        }

        try {
          const locationData = await reverseGeocode(latitude, longitude);
          setLocation(locationData);
        } catch (error) {
          setError('Failed to get location details');
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Failed to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setError(errorMessage);
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  // Auto-detect location on mount if requested
  useEffect(() => {
    if (autoDetect && !location) {
      detectCurrentLocation();
    }
  }, [autoDetect, location]); // Include location to prevent unnecessary re-runs

  return {
    location,
    isDetecting,
    error,
    setLocation,
    detectCurrentLocation,
    clearLocation
  };
};
