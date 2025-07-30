import { useState } from 'react';
import { LocationSelector } from '../Maps/LocationSelector';
import { AssigneeSelector } from './AssigneeSelector';
import { MediaUploader } from './MediaUploader';
import { LocationData } from '../../types';
import { apiClient } from '../../services/api';

interface CreatePostProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onClose, onSuccess }) => {
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'issue' | 'announcement' | 'accomplishment' | 'discussion'>('issue');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(true); // Start with map open
  const [assignee, setAssignee] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  };

  const handleRoleRemove = (roleId: string) => {
    setSelectedRoles(selectedRoles.filter(r => r.id !== roleId));
  };

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location);
    // Clear assignee when location changes since assignees are location-specific
    setAssignee(null);
  };

  const handleAssigneeSelect = (assigneeId: string | null) => {
    setAssignee(assigneeId);
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
    // Clear any previous file upload errors
    if (errors.files) {
      const { files: _, ...otherErrors } = errors;
      setErrors(otherErrors);
    }
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

    if (!assignee) {
      newErrors.assignee = 'Please select an assignee for your post';
    }

    if (!locationData?.latitude || !locationData?.longitude) {
      newErrors.location = 'Please select a location on the map';
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
      // Check if we have files to upload
      if (selectedFiles.length > 0) {
        // Use FormData for multipart upload
        const formData = new FormData();
        
        // Add text fields
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        formData.append('post_type', postType);
        
        if (assignee) formData.append('assignee', assignee);
        if (locationData?.address) formData.append('location', locationData.address);
        if (locationData?.latitude) formData.append('latitude', locationData.latitude.toString());
        if (locationData?.longitude) formData.append('longitude', locationData.longitude.toString());
        if (selectedRoles.length > 0) formData.append('tags', JSON.stringify(selectedRoles.map(role => role.abbreviation)));

        // Add files
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        // Get auth token
        const token = localStorage.getItem('access_token');
        
        // Use XMLHttpRequest for file upload with progress
        const response = await new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.onload = () => {
            if (xhr.status === 201) {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } else {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.detail || 'Failed to create post'));
            }
          };

          xhr.onerror = () => {
            reject(new Error('Network error occurred'));
          };

          xhr.open('POST', '/api/v1/posts');
          
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }

          xhr.send(formData);
        });

        if (response && typeof response === 'object' && 'success' in response && response.success) {
          // Reset form on success
          setTitle('');
          setContent('');
          setPostType('issue');
          setLocationData(null);
          setAssignee(null);
          setSelectedRoles([]);
          setSelectedFiles([]);
          setErrors({});
          
          onSuccess();
          onClose();
        } else {
          const errorMessage = (response && typeof response === 'object' && 'error' in response) 
            ? (response as any).error 
            : 'Failed to create post';
          setErrors({ submit: errorMessage });
        }
      } else {
        // Regular JSON post without files
        const postData = {
          title: title.trim(),
          content: content.trim(),
          post_type: postType,
          assignee: assignee,
          location: locationData?.address || undefined,
          latitude: locationData?.latitude || undefined,
          longitude: locationData?.longitude || undefined,
          tags: selectedRoles.map(role => role.abbreviation),
        };

        const response = await apiClient.post<any>('/posts', postData);
        
        if (response && typeof response === 'object' && 'success' in response && response.success) {
          // Reset form on success
          setTitle('');
          setContent('');
          setPostType('issue');
          setLocationData(null);
          setAssignee(null);
          setSelectedRoles([]);
          setSelectedFiles([]);
          setErrors({});
          
          onSuccess();
          onClose();
        } else {
          const errorMessage = (response && typeof response === 'object' && 'error' in response) 
            ? (response as any).error 
            : 'Failed to create post';
          setErrors({ submit: errorMessage });
        }
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

            {/* Enhanced workflow steps indicator */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-3">Post Creation Workflow</h3>
              <div className="flex items-center space-x-4 text-xs">
                <div className={`flex items-center space-x-2 ${locationData ? 'text-green-600' : 'text-blue-600 font-medium'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${locationData ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {locationData ? '✓' : '1'}
                  </div>
                  <span>Select Location</span>
                  {!locationData && <span className="text-blue-600 font-medium">(Click on map below)</span>}
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className={`flex items-center space-x-2 ${locationData && assignee ? 'text-green-600' : locationData ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${locationData && assignee ? 'bg-green-500' : locationData ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    {locationData && assignee ? '✓' : '2'}
                  </div>
                  <span>Choose Assignee</span>
                  {locationData && !assignee && <span className="text-blue-600 font-medium">(Required)</span>}
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className={`flex items-center space-x-2 ${content.trim() && locationData && assignee ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${content.trim() && locationData && assignee ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    3
                  </div>
                  <span>Create Post</span>
                </div>
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Location * {!locationData && <span className="text-blue-600 font-normal">(Required to show representatives)</span>}
                </label>
                <button
                  type="button"
                  onClick={() => setShowLocationSelector(!showLocationSelector)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showLocationSelector ? 'Hide Map' : 'Select on Map'}
                </button>
              </div>
              
              {!locationData && (
                <div className="mb-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Select Your Location First</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Click anywhere on the map below to select your location. This will show available representatives for your area who can handle your issue.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {locationData && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">✓ Location Selected</p>
                      <p className="text-sm text-green-700 mt-1">{locationData.address}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLocationData(null);
                        setAssignee(null);
                      }}
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

              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            {/* Assignee Selection */}
            <AssigneeSelector
              locationData={locationData}
              selectedAssignee={assignee}
              onAssigneeSelect={handleAssigneeSelect}
              error={errors.assignee}
            />

            {/* Media Upload */}
            <MediaUploader
              onFilesChange={handleFilesChange}
              error={errors.files}
              maxFiles={10}
            />

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