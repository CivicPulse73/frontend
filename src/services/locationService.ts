import { apiClient, ApiResponse } from './api';
import { CivicPost, LocationData } from '../types';

export interface LocationPostsQuery {
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  post_type?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface NearbyPostsResponse {
  posts: CivicPost[];
  total: number;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
}

export interface LocationStatsResponse {
  total_posts: number;
  by_type: {
    issue: number;
    announcement: number;
    accomplishment: number;
    discussion: number;
  };
  by_status: {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
  recent_activity: number; // posts in last 30 days
}

class LocationService {
  /**
   * Get posts near a specific location
   */
  async getNearbyPosts(query: LocationPostsQuery): Promise<NearbyPostsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (query.latitude !== undefined) params.append('latitude', query.latitude.toString());
      if (query.longitude !== undefined) params.append('longitude', query.longitude.toString());
      if (query.radius !== undefined) params.append('radius', query.radius.toString());
      if (query.post_type) params.append('post_type', query.post_type);
      if (query.category) params.append('category', query.category);
      if (query.limit !== undefined) params.append('limit', query.limit.toString());
      if (query.offset !== undefined) params.append('offset', query.offset.toString());

      const response = await apiClient.get<ApiResponse<NearbyPostsResponse>>(`/posts/nearby?${params.toString()}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to fetch nearby posts');
    } catch (error) {
      console.error('Error fetching nearby posts:', error);
      throw error;
    }
  }

  /**
   * Get posts with location data for map display
   */
  async getPostsWithLocations(filters?: {
    post_type?: string;
    category?: string;
    area?: string;
    limit?: number;
  }): Promise<CivicPost[]> {
    try {
      const params = new URLSearchParams();
      params.append('has_location', 'true'); // Only get posts with coordinates
      
      if (filters?.post_type) params.append('post_type', filters.post_type);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.area) params.append('area', filters.area);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<ApiResponse<{ items: CivicPost[] }>>(`/posts?${params.toString()}`);
      
      if (response.success && response.data) {
        return response.data.items.filter(post => 
          post.latitude !== undefined && 
          post.longitude !== undefined
        );
      }
      
      throw new Error(response.error || 'Failed to fetch posts with locations');
    } catch (error) {
      console.error('Error fetching posts with locations:', error);
      throw error;
    }
  }

  /**
   * Get location statistics for a specific area
   */
  async getLocationStats(location: { latitude: number; longitude: number; radius?: number }): Promise<LocationStatsResponse> {
    try {
      const params = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        radius: (location.radius || 10).toString()
      });

      const response = await apiClient.get<ApiResponse<LocationStatsResponse>>(`/posts/location-stats?${params.toString()}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to fetch location statistics');
    } catch (error) {
      console.error('Error fetching location statistics:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get address information
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    try {
      // Using OpenStreetMap Nominatim service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      const address = data.address || {};
      
      return {
        latitude,
        longitude,
        address: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: address.city || address.town || address.village || address.municipality || '',
        state: address.state || '',
        country: address.country || '',
        district: address.state_district || address.district || '',
        pincode: address.postcode || ''
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Return basic location data if geocoding fails
      return {
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: '',
        state: '',
        country: 'India',
        district: '',
        pincode: ''
      };
    }
  }

  /**
   * Forward geocode an address to get coordinates
   */
  async geocodeAddress(address: string): Promise<LocationData[]> {
    try {
      // Using OpenStreetMap Nominatim service with country restriction to India
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&addressdetails=1&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      return data.map((item: any) => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village || '',
        state: item.address?.state || '',
        country: item.address?.country || '',
        district: item.address?.state_district || item.address?.district || '',
        pincode: item.address?.postcode || ''
      }));
    } catch (error) {
      console.error('Address geocoding error:', error);
      return [];
    }
  }

  /**
   * Validate if coordinates are within India bounds
   */
  validateIndiaCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= 6.5 &&
      latitude <= 37.5 &&
      longitude >= 68.0 &&
      longitude <= 97.5
    );
  }
}

export const locationService = new LocationService();
