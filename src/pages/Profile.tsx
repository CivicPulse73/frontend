import { useState, useRef } from 'react'
import { useUser } from '../contexts/UserContext'
import { usePosts } from '../contexts/PostContext'
import { Edit, Bookmark, MessageCircle, TrendingUp, Calendar, MapPin, Eye, Heart, Share2, Filter, Grid, List, MoreHorizontal, Camera, ChevronRight, LogIn } from 'lucide-react'
import Avatar from '../components/Avatar'
import FeedCard from '../components/FeedCard'
import AuthModal from '../components/AuthModal'

export default function Profile() {
  const { user, updateUser, loading } = useUser()
  const { posts } = usePosts()
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'activity'>('posts')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showCoverModal, setShowCoverModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const avatarFileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  // Show auth modal if user is not logged in
  if (!user && !loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your profile</h2>
          <p className="text-gray-600 mb-6">
            Access your posts, saved content, and manage your civic engagement.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const userPosts = posts.filter(post => post.author.id === user.id)
  const savedPosts = posts.filter(post => post.is_saved)
  const totalUpvotes = userPosts.reduce((sum, post) => sum + post.upvotes, 0)
  const totalComments = userPosts.reduce((sum, post) => sum + post.comment_count, 0)
  const totalViews = userPosts.length * 127 // Mock view count
  const joinDate = new Date(2024, 0, 15) // Mock join date
  
  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  // File upload utility functions
  const handleFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file'))
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('File size should be less than 5MB'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        resolve(result)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingAvatar(true)
      const imageUrl = await handleFileUpload(file)
      handleAvatarChange(imageUrl)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploadingAvatar(false)
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = ''
      }
    }
  }

  const handleCoverFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingCover(true)
      const imageUrl = await handleFileUpload(file)
      handleCoverChange(imageUrl)
    } catch (error) {
      console.error('Error uploading cover photo:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploadingCover(false)
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = ''
      }
    }
  }

  const handleAvatarChange = (newAvatarUrl: string) => {
    updateUser({ avatar_url: newAvatarUrl })  // Changed from 'avatar' to 'avatar_url'
    setShowAvatarModal(false)
  }

  const handleEditProfile = () => {
    console.log('Edit profile clicked')
    // TODO: Navigate to edit profile page or open edit modal
  }

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.display_name || user.username}'s Profile - CivicPulse`,
        text: `Check out ${user.display_name || user.username}'s civic contributions on CivicPulse`,
        url: window.location.href
      }).catch(console.error)
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Profile link copied to clipboard!')
      }).catch(console.error)
    }
  }

  const handleMoreOptions = () => {
    console.log('More options clicked')
    // TODO: Show more options menu
  }

  const handleCustomAvatarUpload = () => {
    avatarFileInputRef.current?.click()
  }

  const handleCustomCoverUpload = () => {
    coverFileInputRef.current?.click()
  }

  const handleCoverChange = (newCoverUrl: string) => {
    updateUser({ cover_photo: newCoverUrl })
    setShowCoverModal(false)
  }

  // Predefined avatar options
  const avatarOptions = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1494790108755-2616b332d2f1?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  ]

  // Predefined cover photo options
  const coverOptions = [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80'
  ]

  return (
    <div className="max-w-lg mx-auto">
      {/* Hidden file inputs */}
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileSelect}
        className="hidden"
      />
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverFileSelect}
        className="hidden"
      />

      {/* Enhanced Profile Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div 
          className="h-32 rounded-t-lg relative overflow-hidden cursor-pointer group"
          onClick={() => setShowCoverModal(true)}
          style={{            backgroundImage: user.cover_photo
              ? `url(${user.cover_photo})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300"></div>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setShowCoverModal(true)
            }}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 pt-0 pb-6 px-6 relative">
          {/* Avatar */}
          <div className="relative -mt-12 mb-4">
            <div className="relative inline-block">
              <div 
                onClick={() => setShowAvatarModal(true)}
                className="cursor-pointer group"
              >
                <Avatar
                  src={user.avatar_url}
                  alt={user.display_name || user.username}
                  size="2xl"
                  className="border-2 border-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-300 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.display_name || user.username}</h1>
              {user.verified && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center space-x-1 capitalize">
                <span className={`w-2 h-2 rounded-full ${user.role === 'representative' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                <span>{user.role}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{user.bio || 'No bio provided'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Joined {formatJoinDate(joinDate)}</span>
              </span>
            </div>
            <p className="text-gray-700 text-sm">
              Passionate about making our community better. Let's work together to solve local issues and create positive change! 🏘️✨
            </p>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="text-xl font-bold text-blue-700">{userPosts.length}</div>
              <div className="text-xs text-blue-600 font-medium">Posts</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="text-xl font-bold text-green-700">{formatNumber(totalUpvotes)}</div>
              <div className="text-xs text-green-600 font-medium">Upvotes</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="text-xl font-bold text-purple-700">{totalComments}</div>
              <div className="text-xs text-purple-600 font-medium">Comments</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <div className="text-xl font-bold text-orange-700">{formatNumber(totalViews)}</div>
              <div className="text-xs text-orange-600 font-medium">Views</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button 
              onClick={handleEditProfile}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
            <button 
              onClick={handleShareProfile}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleMoreOptions}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-100">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'posts' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Posts ({userPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-4 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'saved' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Saved ({savedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-4 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'activity' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'posts' && (
            <div>
              {/* View Mode Toggle */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Your Posts</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Posts Content */}
              {userPosts.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-3'}>
                  {userPosts.map((post) => (
                    viewMode === 'list' ? (
                      <FeedCard key={post.id} post={post} />
                    ) : (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{post.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                            post.post_type === 'issue' ? 'bg-red-100 text-red-800' :
                            post.post_type === 'announcement' ? 'bg-blue-100 text-blue-800' :
                            post.post_type === 'news' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {post.post_type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{post.upvotes}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{post.comment_count}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{Math.floor(Math.random() * 200) + 50}</span>
                            </span>
                          </div>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Edit className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500 mb-4">Share your first community update!</p>
                  <button 
                    onClick={() => window.location.href = '/post'}
                    className="btn-primary"
                  >
                    Create Your First Post
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Saved Posts</h3>
              {savedPosts.length > 0 ? (
                <div className="space-y-3">
                  {savedPosts.map((post) => (
                    <div key={post.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Bookmark className="w-4 h-4 text-yellow-500 fill-current" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{post.title}</h4>
                        <p className="text-xs text-gray-500">Saved • {new Date(post.created_at).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bookmark className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved posts</h3>
                  <p className="text-gray-500">Posts you save will appear here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {/* Mock activity timeline */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Your post received <span className="font-medium">15 new upvotes</span></p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New comment on <span className="font-medium">"Pothole on Main Street"</span></p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">You saved a new post about <span className="font-medium">"Community Garden Project"</span></p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-96 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Change Profile Picture</h3>
                <button 
                  onClick={() => setShowAvatarModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span className="text-gray-500 text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Choose a new profile picture:</p>
              
              {/* Avatar Options Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {avatarOptions.map((avatarUrl, index) => (
                  <button
                    key={index}
                    onClick={() => handleAvatarChange(avatarUrl)}
                    className={`relative group transition-all duration-200 ${
                      user.avatar_url === avatarUrl 
                        ? 'ring-4 ring-primary-500 ring-offset-2' 
                        : 'hover:ring-2 hover:ring-primary-300 hover:ring-offset-1'
                    }`}
                  >
                    <Avatar
                      src={avatarUrl}
                      alt={`Avatar option ${index + 1}`}
                      size="xl"
                      className="w-full"
                    />
                    {user.avatar_url === avatarUrl && (
                      <div className="absolute inset-0 bg-primary-500 bg-opacity-20 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Upload Option */}
              <div className="border-t border-gray-100 pt-4">
                <button 
                  onClick={handleCustomAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {isUploadingAvatar ? 'Uploading...' : 'Upload Custom Photo'}
                  </span>
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  JPG, PNG, GIF up to 5MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Photo Selection Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-96 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Change Cover Photo</h3>
                <button 
                  onClick={() => setShowCoverModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span className="text-gray-500 text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Choose a new cover photo:</p>
              
              {/* Cover Options Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {coverOptions.map((coverUrl, index) => (
                  <button
                    key={index}
                    onClick={() => handleCoverChange(coverUrl)}
                    className={`relative group transition-all duration-200 rounded-lg overflow-hidden ${
                      user.cover_photo === coverUrl 
                        ? 'ring-4 ring-primary-500 ring-offset-2' 
                        : 'hover:ring-2 hover:ring-primary-300 hover:ring-offset-1'
                    }`}
                  >
                    <div 
                      className="w-full h-20 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${coverUrl})`,
                      }}
                    />
                    {user.cover_photo === coverUrl && (
                      <div className="absolute inset-0 bg-primary-500 bg-opacity-20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Upload Option */}
              <div className="border-t border-gray-100 pt-4">
                <button 
                  onClick={handleCustomCoverUpload}
                  disabled={isUploadingCover}
                  className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {isUploadingCover ? 'Uploading...' : 'Upload Custom Cover'}
                  </span>
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  JPG, PNG, GIF up to 5MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
