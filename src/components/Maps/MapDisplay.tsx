import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
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

interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
  type?: 'issue' | 'announcement' | 'accomplishment' | 'discussion';
  author?: string;
  created_at?: string;
  onClick?: () => void;
}

interface MapDisplayProps {
  locations: LocationPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  showPopups?: boolean;
}

// India center coordinates
const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

export const MapDisplay: React.FC<MapDisplayProps> = ({
  locations,
  center = INDIA_CENTER,
  zoom = 5,
  height = '400px',
  className = '',
  showPopups = true
}) => {
  // Calculate center based on locations if not provided
  const mapCenter = React.useMemo(() => {
    if (locations.length === 0) return center;
    
    // If only one location, center on it
    if (locations.length === 1) {
      return [locations[0].latitude, locations[0].longitude] as [number, number];
    }
    
    // Calculate center of all locations
    const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
    
    return [avgLat, avgLng] as [number, number];
  }, [locations, center]);

  // Calculate appropriate zoom level based on location spread
  const mapZoom = React.useMemo(() => {
    if (locations.length <= 1) return Math.max(zoom, 10);
    
    // Calculate bounds
    const lats = locations.map(loc => loc.latitude);
    const lngs = locations.map(loc => loc.longitude);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);
    
    // Rough zoom calculation
    if (maxRange > 10) return 4;
    if (maxRange > 5) return 5;
    if (maxRange > 2) return 6;
    if (maxRange > 1) return 7;
    if (maxRange > 0.5) return 8;
    if (maxRange > 0.1) return 9;
    return 10;
  }, [locations, zoom]);

  // Get marker color based on post type
  const getMarkerIcon = (type?: string) => {
    // You can customize marker colors based on post type
    const color = {
      issue: '#ef4444',      // red
      announcement: '#3b82f6', // blue
      accomplishment: '#10b981', // green
      discussion: '#8b5cf6'   // purple
    }[type || 'discussion'] || '#6b7280'; // default gray

    // For now, using the default icon. You could create custom colored icons here
    return DefaultIcon;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTypeLabel = (type?: string) => {
    return {
      issue: 'Issue',
      announcement: 'Announcement',
      accomplishment: 'Accomplishment',
      discussion: 'Discussion'
    }[type || 'discussion'] || 'Post';
  };

  if (locations.length === 0) {
    return (
      <div 
        className={`bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">No locations to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-300"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={getMarkerIcon(location.type)}
            eventHandlers={{
              click: () => {
                if (location.onClick) {
                  location.onClick();
                }
              }
            }}
          >
            {showPopups && (
              <Popup>
                <div className="min-w-0 max-w-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      location.type === 'issue' ? 'bg-red-100 text-red-800' :
                      location.type === 'announcement' ? 'bg-blue-100 text-blue-800' :
                      location.type === 'accomplishment' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {getTypeLabel(location.type)}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {location.title}
                  </h3>
                  
                  {location.address && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {location.address}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {location.author && (
                      <span>By {location.author}</span>
                    )}
                    {location.created_at && (
                      <span>{formatDate(location.created_at)}</span>
                    )}
                  </div>
                  
                  {location.onClick && (
                    <button
                      onClick={location.onClick}
                      className="mt-2 w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
