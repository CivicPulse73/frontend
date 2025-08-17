import React, { useState } from 'react';
import { LocationSelector, MapDisplay } from '../components/Maps';
import { LocationData } from '../types';

const MapDemo: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(true);

  // Sample posts with locations for map display
  const samplePosts = [
    {
      id: '1',
      latitude: 28.6139,
      longitude: 77.2090,
      title: 'Road Pothole Issue in CP',
      address: 'Connaught Place, New Delhi',
      type: 'issue' as const,
      author: 'John Doe',
      created_at: '2025-01-15T10:30:00Z'
    },
    {
      id: '2', 
      latitude: 28.5494,
      longitude: 77.2500,
      title: 'New Metro Station Announcement',
      address: 'India Gate, New Delhi',
      type: 'announcement' as const,
      author: 'Delhi Metro',
      created_at: '2025-01-14T15:45:00Z'
    },
    {
      id: '3',
      latitude: 28.6562,
      longitude: 77.2410,
      title: 'Community Garden Success',
      address: 'Chandni Chowk, Delhi',
      type: 'accomplishment' as const,
      author: 'Green Initiative',
      created_at: '2025-01-13T09:15:00Z'
    }
  ];

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    console.log('Location selected:', location);
  };

  const handlePostClick = (postId: string) => {
    console.log('Post clicked:', postId);
    alert(`Clicked on post ${postId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CivicPulse Map Components Demo
          </h1>
          <p className="text-lg text-gray-600">
            Interactive maps for location-based civic engagement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location Selector */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Location Selector</h2>
              <button
                onClick={() => setShowLocationSelector(!showLocationSelector)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {showLocationSelector ? 'Hide' : 'Show'} Selector
              </button>
            </div>
            
            {showLocationSelector && (
              <LocationSelector
                onLocationSelect={handleLocationSelect}
                initialLocation={selectedLocation || undefined}
                height="350px"
              />
            )}

            {selectedLocation && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Selected Location:</h3>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>Address:</strong> {selectedLocation.address}</p>
                  <p><strong>Coordinates:</strong> {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}</p>
                  {selectedLocation.city && <p><strong>City:</strong> {selectedLocation.city}</p>}
                  {selectedLocation.state && <p><strong>State:</strong> {selectedLocation.state}</p>}
                  {selectedLocation.pincode && <p><strong>PIN:</strong> {selectedLocation.pincode}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Map Display */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Posts Map Display</h2>
            
            <MapDisplay
              locations={samplePosts.map(post => ({
                ...post,
                onClick: () => handlePostClick(post.id)
              }))}
              height="350px"
              showPopups={true}
            />

            <div className="mt-4">
              <h3 className="font-medium text-gray-800 mb-2">Legend:</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>Issues</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>Announcements</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Accomplishments</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span>Discussions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Location Selector</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Click anywhere on the map to select a location</li>
                <li>• Drag the marker to fine-tune the position</li>
                <li>• Use the location button to get your current position</li>
                <li>• Edit the address text directly if needed</li>
                <li>• Selection is restricted to India</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Posts Map Display</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• View all posts with location data on the map</li>
                <li>• Click on markers to see post details</li>
                <li>• Different colors represent different post types</li>
                <li>• Map automatically centers based on post locations</li>
                <li>• Zoom level adjusts to show all posts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Data Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This is a demo page showing the map components. 
            The sample posts are for demonstration only. In the actual app, these would come from the backend API.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapDemo;
