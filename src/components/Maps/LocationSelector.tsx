import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Icon, LatLng, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Configure default icon
const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom location pin icon for better visibility
const LocationIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -40],
  shadowSize: [48, 48]
});

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  district?: string;
  pincode?: string;
}

interface LocationSelectorProps {
  onLocationSelect: (location: LocationData) => void;
  onLocationCancel?: () => void;
  initialLocation?: LocationData;
  className?: string;
  height?: string;
  showAddressInput?: boolean;
  showConfirmButtons?: boolean; // New prop to control confirmation behavior
}

// India bounds
const INDIA_BOUNDS = {
  north: 37.5,
  south: 6.5,
  east: 97.5,
  west: 68.0
};

// Default center (approximately center of India)
const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

// Component to handle map view updates
const MapViewController: React.FC<{
  center: [number, number];
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && center) {
      // Only update if the center has actually changed significantly (to avoid infinite loops)
      const currentCenter = map.getCenter();
      const distance = Math.sqrt(
        Math.pow(currentCenter.lat - center[0], 2) + 
        Math.pow(currentCenter.lng - center[1], 2)
      );
      
      // Update if the distance is more than 0.001 degrees (roughly 100 meters)
      if (distance > 0.001 || Math.abs(map.getZoom() - zoom) > 0.5) {
        map.setView(center, zoom, { animate: true, duration: 1.5 });
      }
    }
  }, [map, center, zoom]);
  
  return null;
};

// Component to handle map events with improved UX
const LocationMarker: React.FC<{
  position: [number, number] | null;
  onLocationChange: (lat: number, lng: number) => void;
  isLoading: boolean;
}> = ({ position, onLocationChange, isLoading }) => {
  const map = useMap();

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      
      // Check if the clicked location is within India bounds
      if (
        lat >= INDIA_BOUNDS.south &&
        lat <= INDIA_BOUNDS.north &&
        lng >= INDIA_BOUNDS.west &&
        lng <= INDIA_BOUNDS.east
      ) {
        onLocationChange(lat, lng);
      } else {
        // Show a more user-friendly message
        alert('⚠️ Please select a location within India. This app is designed for Indian civic issues.');
      }
    },
  });

  // Auto-zoom to marker when position changes
  useEffect(() => {
    if (position && map) {
      // Use a higher zoom level (15) for better precision and user experience
      map.setView(position, 15, { animate: true });
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker 
      position={position} 
      icon={LocationIcon}
      draggable={!isLoading}
      eventHandlers={{
        dragend: (e) => {
          if (!isLoading) {
            const marker = e.target;
            const newPosition = marker.getLatLng();
            
            // Check bounds on drag
            if (
              newPosition.lat >= INDIA_BOUNDS.south &&
              newPosition.lat <= INDIA_BOUNDS.north &&
              newPosition.lng >= INDIA_BOUNDS.west &&
              newPosition.lng <= INDIA_BOUNDS.east
            ) {
              onLocationChange(newPosition.lat, newPosition.lng);
            } else {
              // Reset to original position if dragged outside bounds
              marker.setLatLng(position);
              alert('⚠️ Location must be within India boundaries');
            }
          }
        },
      }}
    />
  );
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  onLocationCancel,
  initialLocation,
  className = '',
  height = '400px',
  showAddressInput = true,
  showConfirmButtons = true // Default to true for better UX
}) => {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null
  );
  const [locationData, setLocationData] = useState<LocationData | null>(initialLocation || null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState(initialLocation?.address || '');
  const [mapError, setMapError] = useState<string | null>(null);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(INDIA_CENTER);
  const [initialZoom, setInitialZoom] = useState(5);
  const [hasAttemptedLocation, setHasAttemptedLocation] = useState(false);
  const debounceTimeoutRef = useRef<number>();

  // Debounced reverse geocoding
  const debouncedReverseGeocode = useCallback((lat: number, lng: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(async () => {
      setIsLoadingAddress(true);
      setMapError(null);
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'CivicPulse/1.0 (civic engagement app)'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to get location details');
        }
        
        const data = await response.json();
        
        let address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        // Clean up the address to be more readable
        if (data.address) {
          const parts = [];
          if (data.address.house_number) parts.push(data.address.house_number);
          if (data.address.road) parts.push(data.address.road);
          if (data.address.neighbourhood) parts.push(data.address.neighbourhood);
          if (data.address.suburb) parts.push(data.address.suburb);
          if (data.address.city || data.address.town || data.address.village) {
            parts.push(data.address.city || data.address.town || data.address.village);
          }
          if (data.address.state) parts.push(data.address.state);
          
          if (parts.length > 0) {
            address = parts.join(', ');
          }
        }
        
        const newLocationData: LocationData = {
          latitude: lat,
          longitude: lng,
          address,
          city: data.address?.city || data.address?.town || data.address?.village,
          state: data.address?.state,
          country: data.address?.country,
          district: data.address?.state_district,
          pincode: data.address?.postcode,
        };
        
        setLocationData(newLocationData);
        setManualAddress(address);
        
        // Only auto-select if showConfirmButtons is false (backward compatibility)
        if (!showConfirmButtons) {
          onLocationSelect(newLocationData);
        }
        
        // Show success feedback
        setShowSuccessFeedback(true);
        setTimeout(() => setShowSuccessFeedback(false), 2000);
        
      } catch (error) {
        console.error('Error fetching address:', error);
        setMapError('Unable to get address details. You can still use this location.');
        
        // Fallback location data
        const fallbackLocationData: LocationData = {
          latitude: lat,
          longitude: lng,
          address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        };
        
        setLocationData(fallbackLocationData);
        setManualAddress(fallbackLocationData.address);
        
        // Only auto-select if showConfirmButtons is false (backward compatibility)
        if (!showConfirmButtons) {
          onLocationSelect(fallbackLocationData);
        }
      } finally {
        setIsLoadingAddress(false);
      }
    }, 1000); // 1 second debounce
  }, [onLocationSelect]);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    debouncedReverseGeocode(lat, lng);
  }, [debouncedReverseGeocode]);

  // Auto-detect user's current location on component mount
  useEffect(() => {
    // Only attempt if we don't have an initial location and haven't tried yet
    if (!initialLocation && !hasAttemptedLocation) {
      setHasAttemptedLocation(true);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Check if current location is within India bounds
            if (
              latitude >= INDIA_BOUNDS.south &&
              latitude <= INDIA_BOUNDS.north &&
              longitude >= INDIA_BOUNDS.west &&
              longitude <= INDIA_BOUNDS.east
            ) {
              // Set the map center and zoom to user's location
              setMapCenter([latitude, longitude]);
              setInitialZoom(15); // Higher zoom for better UX
              
              // Automatically select this location
              handleLocationChange(latitude, longitude);
            } else {
              // User is outside India, just center on India with a wider view
              setMapCenter(INDIA_CENTER);
              setInitialZoom(5);
            }
          },
          (error) => {
            // Silently fail and use default India center
            console.log('Could not get user location:', error.message);
            setMapCenter(INDIA_CENTER);
            setInitialZoom(5);
          },
          {
            enableHighAccuracy: false, // Use less accurate but faster location
            timeout: 5000, // 5 second timeout
            maximumAge: 300000 // Accept location up to 5 minutes old
          }
        );
      } else {
        // Geolocation not supported, use default
        setMapCenter(INDIA_CENTER);
        setInitialZoom(5);
      }
    } else if (initialLocation) {
      // If we have an initial location, center on it with proper zoom
      setMapCenter([initialLocation.latitude, initialLocation.longitude]);
      setInitialZoom(15);
    }
  }, [initialLocation, hasAttemptedLocation, handleLocationChange]);

  const handleManualAddressChange = (newAddress: string) => {
    setManualAddress(newAddress);
    
    if (locationData) {
      const updatedLocation = { ...locationData, address: newAddress };
      setLocationData(updatedLocation);
      onLocationSelect(updatedLocation);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('❌ Geolocation is not supported by this browser. Please click on the map to select a location.');
      return;
    }

    setIsLoadingLocation(true);
    setMapError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Check if current location is within India bounds
        if (
          latitude >= INDIA_BOUNDS.south &&
          latitude <= INDIA_BOUNDS.north &&
          longitude >= INDIA_BOUNDS.west &&
          longitude <= INDIA_BOUNDS.east
        ) {
          // Update map center and select this location
          setMapCenter([latitude, longitude]);
          handleLocationChange(latitude, longitude);
        } else {
          setMapError('🌍 Your current location appears to be outside India. Please select a location within India on the map.');
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting current location:', error);
        let errorMessage = '❌ Unable to get your current location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access and try again, or click on the map to select manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please click on the map to select manually.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please click on the map to select manually.';
            break;
          default:
            errorMessage += 'Please click on the map to select a location manually.';
            break;
        }
        
        setMapError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container with improved styling */}
      <div className="relative rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <MapContainer
          center={mapCenter}
          zoom={initialZoom}
          style={{ height, width: '100%' }}
          className="z-0"
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          <MapViewController center={mapCenter} zoom={initialZoom} />
          <LocationMarker 
            position={position} 
            onLocationChange={handleLocationChange}
            isLoading={isLoadingAddress || isLoadingLocation}
          />
        </MapContainer>
        
        {/* Current Location Button with improved styling */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className={`absolute top-3 right-3 bg-white shadow-lg rounded-lg p-2.5 hover:bg-gray-50 z-[1000] transition-all border border-gray-200 ${
            isLoadingLocation ? 'cursor-not-allowed opacity-60' : 'hover:shadow-xl'
          }`}
          title="Use current location"
        >
          {isLoadingLocation ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          ) : (
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        {/* Loading overlay for address lookup */}
        {isLoadingAddress && (
          <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg z-[1000] flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="text-sm font-medium">Getting address...</span>
          </div>
        )}

        {/* Success feedback */}
        {showSuccessFeedback && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg z-[1000] flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Location selected!</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {mapError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">{mapError}</p>
        </div>
      )}

      {/* Confirmation Buttons */}
      {showConfirmButtons && locationData && (
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              if (locationData) {
                onLocationSelect(locationData);
              }
            }}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Confirm Location
          </button>
          <button
            type="button"
            onClick={() => {
              if (onLocationCancel) {
                onLocationCancel();
              }
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
