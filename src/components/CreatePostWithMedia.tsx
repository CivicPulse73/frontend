/**
 * Frontend integration example for CivicPulse S3 media upload
 * This demonstrates how to use the updated /posts endpoint with file uploads
 */

import React, { useState } from 'react';

interface CreatePostWithMediaProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const CreatePostWithMedia: React.FC<CreatePostWithMediaProps> = ({ onSuccess, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    post_type: 'issue',
    assignee: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    tags: [] as string[]
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // File validation
  const validateFiles = (files: File[]): string[] => {
    const errors: string[] = [];
    const maxFiles = 10;
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    files.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: Invalid file type. Allowed: images and videos only`);
      }

      if (allowedImageTypes.includes(file.type) && file.size > maxImageSize) {
        errors.push(`File ${index + 1}: Image too large (max 10MB)`);
      }

      if (allowedVideoTypes.includes(file.type) && file.size > maxVideoSize) {
        errors.push(`File ${index + 1}: Video too large (max 100MB)`);
      }
    });

    return errors;
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validationErrors = validateFiles(files);
    
    if (validationErrors.length > 0) {
      setErrors({ files: validationErrors.join(', ') });
      setSelectedFiles([]);
    } else {
      setErrors({ ...errors, files: '' });
      setSelectedFiles(files);
    }
  };

  // Remove selected file
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setErrors({ submit: 'Title and content are required' });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Create FormData for multipart upload
      const uploadFormData = new FormData();
      
      // Add text fields
      uploadFormData.append('title', formData.title.trim());
      uploadFormData.append('content', formData.content.trim());
      uploadFormData.append('post_type', formData.post_type);
      
      if (formData.assignee) uploadFormData.append('assignee', formData.assignee);
      if (formData.location) uploadFormData.append('location', formData.location);
      if (formData.latitude) uploadFormData.append('latitude', formData.latitude.toString());
      if (formData.longitude) uploadFormData.append('longitude', formData.longitude.toString());
      if (formData.tags.length > 0) uploadFormData.append('tags', JSON.stringify(formData.tags));

      // Add files
      selectedFiles.forEach(file => {
        uploadFormData.append('files', file);
      });

      // Get auth token (adjust based on your auth implementation)
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);
            console.log('Post created successfully:', response);
            onSuccess();
            resolve();
          } else {
            const error = JSON.parse(xhr.responseText);
            setErrors({ submit: error.detail || 'Failed to create post' });
            reject(new Error(error.detail));
          }
        };

        xhr.onerror = () => {
          setErrors({ submit: 'Network error occurred' });
          reject(new Error('Network error'));
        };

        xhr.open('POST', '/api/v1/posts');
        
        // Set headers
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.send(uploadFormData);
      });

    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Upload failed' });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Create Post with Media</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter post title..."
                maxLength={500}
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your post..."
                maxLength={10000}
                required
              />
            </div>

            {/* Post Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Post Type *</label>
              <select
                value={formData.post_type}
                onChange={(e) => setFormData({ ...formData, post_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="issue">Issue</option>
                <option value="announcement">Announcement</option>
                <option value="news">News</option>
                <option value="accomplishment">Accomplishment</option>
                <option value="discussion">Discussion</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Media Files (Optional)</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Max 10 files. Images: 10MB each (JPEG, PNG, GIF, WebP). Videos: 100MB each (MP4, WebM, etc.)
              </p>
              {errors.files && <p className="text-red-500 text-sm mt-1">{errors.files}</p>}
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {file.type.startsWith('image/') ? '🖼️' : '🎥'}
                        </span>
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
