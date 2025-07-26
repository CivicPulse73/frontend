import { useEffect, useState } from 'react';
import { roleService, Role } from '../../services/roleService';
import { RoleTag } from './RoleTag';
import { LocationSelector } from '../Maps/LocationSelector';
import { LocationData } from '../../types';
import { apiClient } from '../../services/api';

interface CreatePostProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onClose, onSuccess }) => {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'issue' | 'announcement' | 'accomplishment' | 'discussion'>('issue');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadRoles = async () => {
      await roleService.ensureRolesLoaded();
      setAvailableRoles(roleService.getRoles());
    };
    loadRoles();
  }, []);

  const filteredRoles = availableRoles.filter(role => 
    role.role_name.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
    role.abbreviation.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(roleSearchQuery.toLowerCase())
  );

  const handleRoleSelect = (role: Role) => {
    if (!selectedRoles.find(r => r.id === role.id)) {
      setSelectedRoles([...selectedRoles, role].sort((a, b) => a.h_order - b.h_order));
    }
  };

  const handleRoleRemove = (roleId: string) => {
    setSelectedRoles(selectedRoles.filter(r => r.id !== roleId));
  };

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 500) {
      newErrors.title = 'Title must be less than 500 characters';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length > 10000) {
      newErrors.content = 'Content must be less than 10000 characters';
    }

    if (category && category.length > 100) {
      newErrors.category = 'Category must be less than 100 characters';
    }

    if (area && area.length > 100) {
      newErrors.area = 'Area must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        post_type: postType,
        category: category.trim() || undefined,
        area: area.trim() || undefined,
        location: locationData?.address || undefined,
        latitude: locationData?.latitude || undefined,
        longitude: locationData?.longitude || undefined,
        tags: selectedRoles.map(role => role.abbreviation),
      };

      const response = await apiClient.post<any>('/posts', postData);
      
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        onSuccess();
        onClose();
      } else {
        const errorMessage = (response && typeof response === 'object' && 'error' in response) 
          ? (response as any).error 
          : 'Failed to create post';
        setErrors({ submit: errorMessage });
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      setErrors({ submit: error.message || 'Failed to create post' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Post Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Type *
              </label>
              <div className="flex flex-wrap gap-2">
                {(['issue', 'announcement', 'accomplishment', 'discussion'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPostType(type)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      postType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter a descriptive title for your post"
                maxLength={500}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your post in detail..."
                maxLength={10000}
              />
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
              <p className="mt-1 text-sm text-gray-500">{content.length}/10000 characters</p>
            </div>

            {/* Category and Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Infrastructure, Education, Health"
                  maxLength={100}
                />
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <input
                  type="text"
                  id="area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.area ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Bangalore, Mumbai, Delhi"
                  maxLength={100}
                />
                {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Location (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowLocationSelector(!showLocationSelector)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showLocationSelector ? 'Hide Map' : 'Select on Map'}
                </button>
              </div>
              
              {locationData && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Location Selected</p>
                      <p className="text-sm text-green-700 mt-1">{locationData.address}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocationData(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {showLocationSelector && (
                <div className="border border-gray-300 rounded-md p-4">
                  <LocationSelector
                    onLocationSelect={handleLocationSelect}
                    initialLocation={locationData || undefined}
                    height="300px"
                    showAddressInput={false}
                  />
                </div>
              )}
            </div>

            {/* Role Tags Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag Roles (Optional)
              </label>
              
              {/* Selected Roles */}
              {selectedRoles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedRoles.map((role) => (
                    <div key={role.id} className="relative">
                      <RoleTag role={role} showTooltip={false} />
                      <button
                        type="button"
                        onClick={() => handleRoleRemove(role.id)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Role Search */}
              <input
                type="text"
                placeholder="Search roles to tag..."
                value={roleSearchQuery}
                onChange={(e) => setRoleSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Available Roles */}
              {roleSearchQuery && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        disabled={!!selectedRoles.find(r => r.id === role.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{role.abbreviation}</span>
                            <span className="text-gray-600 ml-2">{role.role_name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{role.level}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">No roles found matching your search</div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};