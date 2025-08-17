import { useState } from 'react'
import { usePosts } from '../contexts/PostContext'
import { useUser } from '../contexts/UserContext'
import { Camera, MapPin, Tag, CheckCircle, AlertCircle, X, Upload, Video, Image, LogIn, Users } from 'lucide-react'
import AuthModal from '../components/AuthModal'
import { LocationSelector } from '../components/Maps/LocationSelector'
import { AssigneeSelector } from '../components/Posts/AssigneeSelector'
import { MediaUploader } from '../components/Posts/MediaUploader'
import { LocationData, AssigneeOption } from '../types'

const postTypes = [
  { 
    value: 'issue', 
    label: 'Report Issue', 
    color: 'bg-red-500',
    description: 'Report problems that need attention',
    icon: AlertCircle
  },
  { 
    value: 'announcement', 
    label: 'Announcement', 
    color: 'bg-blue-500',
    description: 'Share important community news',
    icon: CheckCircle
  },
  { 
    value: 'accomplishment', 
    label: 'Accomplishment', 
    color: 'bg-purple-500',
    description: 'Celebrate community successes',
    icon: CheckCircle
  }
]

export default function Post() {
  const { addPost } = usePosts()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  const [formData, setFormData] = useState({
    type: 'issue' as const,
    title: '',
    description: ''
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!selectedAssignee) {
      newErrors.assignee = 'Please select a representative to assign this post to'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location)
  }

  const handleAssigneeSelect = (assigneeId: string | null) => {
    setSelectedAssignee(assigneeId)
  }

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files)
    // Clear any previous file upload errors
    if (errors.files) {
      const { files: _, ...otherErrors } = errors;
      setErrors(otherErrors);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted', { user, formData })
    
    if (!user) {
      console.error('No user found, cannot submit post')
      setErrors({ submit: 'You must be logged in to create a post. Please log in and try again.' })
      return
    }
    
    if (!validateForm()) {
      console.error('Form validation failed')
      return
    }

    setIsSubmitting(true)
    // Clear any previous submit errors
    const { submit, ...otherErrors } = errors
    setErrors(otherErrors)

    try {
      // Check if we have files to upload
      if (selectedFiles.length > 0) {
        // Use FormData for multipart upload
        const formDataUpload = new FormData();
        
        // Add text fields
        formDataUpload.append('title', formData.title);
        formDataUpload.append('content', formData.description);
        formDataUpload.append('post_type', formData.type);
        
        if (selectedAssignee) formDataUpload.append('assignee', selectedAssignee);
        if (locationData?.address) formDataUpload.append('location', locationData.address);
        if (locationData?.latitude) formDataUpload.append('latitude', locationData.latitude.toString());
        if (locationData?.longitude) formDataUpload.append('longitude', locationData.longitude.toString());

        // Add files
        selectedFiles.forEach(file => {
          formDataUpload.append('files', file);
        });

        // Get auth token
        const token = localStorage.getItem('civic_access_token');
        
        // Use XMLHttpRequest for file upload with progress
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 201) {
              resolve();
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

          xhr.send(formDataUpload);
        });
      } else {
        // Use FormData even without files since backend expects multipart/form-data
        const formDataUpload = new FormData();
        
        // Add text fields
        formDataUpload.append('title', formData.title);
        formDataUpload.append('content', formData.description);
        formDataUpload.append('post_type', formData.type);
        
        if (selectedAssignee) formDataUpload.append('assignee', selectedAssignee);
        if (locationData?.address) formDataUpload.append('location', locationData.address);
        if (locationData?.latitude) formDataUpload.append('latitude', locationData.latitude.toString());
        if (locationData?.longitude) formDataUpload.append('longitude', locationData.longitude.toString());

        // Get auth token
        const token = localStorage.getItem('civic_access_token');
        
        // Use XMLHttpRequest for consistency
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 201) {
              resolve();
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

          xhr.send(formDataUpload);
        });
      }

      // Reset form
      setFormData({
        type: 'issue',
        title: '',
        description: ''
      })
      setSelectedFiles([])
      setLocationData(null)
      setSelectedAssignee(null)
      setShowLocationSelector(false)
      setErrors({})
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)

    } catch (error) {
      console.error('Error creating post:', error)
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post'
      setErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-down">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Post created successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          {/* Authentication Check */}
          {!user && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-yellow-700 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>You need to be logged in to create a post.</span>
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Create New Post</h1>
            <div className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              {formData.type === 'issue' ? '🚨' : formData.type === 'announcement' ? '📢' : '🎉'} {postTypes.find(t => t.value === formData.type)?.label}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What would you like to share?
              </label>
              <div className="grid gap-3">
                {postTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({...formData, type: type.value as any})}
                      className={`p-4 rounded-xl border-2 text-left transition-all transform hover:scale-[1.02] ${
                        formData.type === type.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full ${type.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold block">{type.label}</span>
                          <span className="text-xs text-gray-500">{type.description}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
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
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter a clear, descriptive title..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.title}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Provide detailed information about your post..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.description}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Location Selection with Map */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Precise Location (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowLocationSelector(!showLocationSelector)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center space-x-1 ${
                    showLocationSelector 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{showLocationSelector ? 'Hide Map' : 'Select on Map'}</span>
                </button>
              </div>

              {locationData && (
                <div className="mb-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm font-medium text-green-800">Location Selected</p>
                      </div>
                      <p className="text-sm text-green-700 mb-1">{locationData.address}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-green-600">
                        <span className="bg-green-100 px-2 py-1 rounded">
                          📍 {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                        </span>
                        {locationData.city && (
                          <span className="bg-green-100 px-2 py-1 rounded">
                            🏘️ {locationData.city}
                          </span>
                        )}
                        {locationData.state && (
                          <span className="bg-green-100 px-2 py-1 rounded">
                            🏛️ {locationData.state}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocationData(null)}
                      className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 rounded transition-colors"
                      title="Remove location"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {showLocationSelector && (
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <div className="bg-blue-50 border-b border-blue-200 p-3">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Select your exact location</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Click anywhere on the map or use your current location to pinpoint the exact spot
                    </p>
                  </div>
                  <div className="p-4">
                    <LocationSelector
                      onLocationSelect={handleLocationSelect}
                      initialLocation={locationData || undefined}
                      height="320px"
                      showAddressInput={false}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Assignee Selection */}
            <div>              
              <AssigneeSelector
                locationData={locationData}
                selectedAssignee={selectedAssignee}
                onAssigneeSelect={handleAssigneeSelect}
                error={errors.assignee}
              />
              
              {errors.assignee && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.assignee}</span>
                </p>
              )}
              
              {!locationData && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Select a location above to see available representatives</span>
                  </p>
                </div>
              )}
            </div>

            {/* Media Upload */}
            <MediaUploader
              onFilesChange={handleFilesChange}
              error={errors.files}
              maxFiles={10}
            />

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.submit}</span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !user}
              className={`w-full py-4 rounded-xl font-semibold transition-all transform ${
                isSubmitting || !user
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'btn-primary hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Post...</span>
                </div>
              ) : !user ? (
                <>Please Log In to Create Post</>
              ) : (
                <>Create Post</>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By posting, you agree to share this information with your local community and representatives.
            </p>
          </form>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
      />
    </div>
  )
}
