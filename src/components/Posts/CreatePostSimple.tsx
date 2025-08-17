import { useState } from 'react';
import { LocationSelector } from '../Maps/LocationSelector';
import { AssigneeSelector } from './AssigneeSelector';
import { LocationData } from '../../types';
import { apiClient } from '../../services/api';

interface CreatePostSimpleProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePostSimple: React.FC<CreatePostSimpleProps> = ({ onClose, onSuccess }) => {
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'issue' | 'announcement' | 'accomplishment' | 'discussion'>('issue');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [assignee, setAssignee] = useState<string | null>(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location);
    setAssignee(null); // Clear assignee when location changes
  };

  const handleAssigneeSelect = (assigneeId: string | null) => {
    setAssignee(assigneeId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Use FormData since backend expects multipart/form-data
      const formData = new FormData();
      
      // Add required fields
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('post_type', postType);
      formData.append('assignee', assignee!);
      
      // Add optional fields
      if (locationData?.address) {
        formData.append('location', locationData.address);
      }
      if (locationData?.latitude) {
        formData.append('latitude', locationData.latitude.toString());
      }
      if (locationData?.longitude) {
        formData.append('longitude', locationData.longitude.toString());
      }

      const response = await apiClient.postFormData<any>('/posts', formData);
      
      if (response && response.success) {
        // Reset form on success
        setTitle('');
        setContent('');
        setPostType('issue');
        setLocationData(null);
        setAssignee(null);
        setErrors({});
        
        onSuccess();
        onClose();
      } else {
        const errorMessage = response?.message || 'Failed to create post';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter post title..."
              maxLength={500}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's happening in your community?"
              maxLength={10000}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* Post Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post Type *
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="issue">Issue</option>
              <option value="announcement">Announcement</option>
              <option value="accomplishment">Accomplishment</option>
              <option value="discussion">Discussion</option>
            </select>
          </div>

          {/* Location Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              initialLocation={locationData || undefined}
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Assignee Selector */}
          {locationData && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee *
              </label>
              <AssigneeSelector
                locationData={locationData}
                onAssigneeSelect={handleAssigneeSelect}
                selectedAssignee={assignee}
              />
              {errors.assignee && (
                <p className="text-red-500 text-sm mt-1">{errors.assignee}</p>
              )}
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
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
