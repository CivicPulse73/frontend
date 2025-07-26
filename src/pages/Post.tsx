import { useState } from 'react'
import { usePosts } from '../contexts/PostContext'
import { useUser } from '../contexts/UserContext'
import { Camera, MapPin, Tag, CheckCircle, AlertCircle, X, Upload, Video, Image, LogIn } from 'lucide-react'
import AuthModal from '../components/AuthModal'
import { LocationSelector } from '../components/Maps/LocationSelector'
import { LocationData } from '../types'

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

const categories = [
  'Infrastructure', 'Public Safety', 'Transportation', 'Environment',
  'Health', 'Education', 'Housing', 'Community Services'
]

const areas = [
  'Downtown District', 'Riverside', 'Oak Hills', 'Sunset Valley',
  'Pine Ridge', 'Cedar Park', 'Maple Heights', 'Willow Creek'
]

export default function Post() {
  const { addPost } = usePosts()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mediaUrl, setMediaUrl] = useState<string>('')
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>('none')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  
  const [formData, setFormData] = useState({
    type: 'issue' as const,
    title: '',
    description: '',
    area: '',
    category: '',
    image: '',
    video: ''
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

    if (!formData.area) {
      newErrors.area = 'Please select an area'
    }

    if (formData.type === 'issue' && !formData.category) {
      newErrors.category = 'Please select a category for issues'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location)
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
      const mediaUrls = []
      if (formData.image) mediaUrls.push(formData.image)
      if (formData.video) mediaUrls.push(formData.video)
      
      const postPayload = {
        post_type: formData.type,
        title: formData.title,
        content: formData.description,
        area: formData.area,
        category: formData.category || undefined,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        location: locationData?.address || formData.area,
        latitude: locationData?.latitude || undefined,
        longitude: locationData?.longitude || undefined
      }
      
      console.log('Submitting post:', postPayload)
      await addPost(postPayload)

      // Reset form
      setFormData({
        type: 'issue',
        title: '',
        description: '',
        area: '',
        category: '',
        image: '',
        video: ''
      })
      setMediaUrl('')
      setMediaType('none')
      setLocationData(null)
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

  const handleMediaChange = (url: string) => {
    // Auto-detect media type based on file extension
    const isVideo = /\.(mp4|webm|ogg|mov|avi|wmv)(\?.*)?$/i.test(url)
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || (!isVideo && url.length > 0)
    
    if (isVideo) {
      setFormData({...formData, video: url, image: ''})
      setMediaType('video')
    } else if (isImage) {
      setFormData({...formData, image: url, video: ''})
      setMediaType('image')
    } else if (url.length === 0) {
      setFormData({...formData, image: '', video: ''})
      setMediaType('none')
    }
    
    setMediaUrl(url)
  }

  const clearMedia = () => {
    setFormData({...formData, image: '', video: ''})
    setMediaUrl('')
    setMediaType('none')
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

            {/* Area */}
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Area/Ward *
              </label>
              <select
                id="area"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.area ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select your area</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              {errors.area && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.area}</span>
                </p>
              )}
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

              {/* Helper text when map is hidden */}
              {!showLocationSelector && !locationData && (
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>Add a precise location to help community members find and address this issue more effectively</span>
                  </p>
                </div>
              )}
              
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

            {/* Category (for issues) */}
            {formData.type === 'issue' && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select issue category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.category}</span>
                  </p>
                )}
              </div>
            )}

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="w-4 h-4 inline mr-1" />
                Add Media (optional)
              </label>
              
              {mediaUrl ? (
                <div className="relative">
                  {mediaType === 'image' && (
                    <img
                      src={mediaUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                    />
                  )}
                  {mediaType === 'video' && (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                  
                  {/* Media Controls */}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Allow replacing media
                        setMediaUrl('')
                        setMediaType('none')
                      }}
                      className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                      title="Replace media"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={clearMedia}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove media"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Media Type Indicator */}
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs flex items-center space-x-1">
                      {mediaType === 'image' ? (
                        <>
                          <Image className="w-3 h-3" />
                          <span>Photo</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-3 h-3" />
                          <span>Video</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    placeholder="Paste image or video URL here..."
                    value={mediaUrl}
                    onChange={(e) => handleMediaChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                  <div className="mt-2 text-center">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-primary-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Enter a media URL above - supports images (JPG, PNG, GIF) and videos (MP4, WebM)
                      </p>
                      <div className="mt-2 flex justify-center space-x-4 text-xs text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Image className="w-3 h-3" />
                          <span>Images</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Video className="w-3 h-3" />
                          <span>Videos</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
