import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, Settings, Edit, MessageCircle, TrendingUp, FileText, Users, Camera, MapPin, Calendar, Share2, MoreHorizontal } from 'lucide-react'
import { usePosts } from '../contexts/PostContext'
import { useUser } from '../contexts/UserContext'
import { userService } from '../services/users'
import { postsService } from '../services/posts'
import { followService } from '../services/follows'
import { User, CivicPost } from '../types'
import Avatar from '../components/Avatar'
import RepresentativeAccountTags from '../components/RepresentativeAccountTags'
import FollowButton from '../components/FollowButton'
import FollowStats from '../components/FollowStats'
import FollowModal from '../components/FollowModal'

export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { posts } = usePosts()
  const { user: currentUser } = useUser()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers')
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 })
  const [assignedTickets, setAssignedTickets] = useState<CivicPost[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'assigned'>('posts')

  // Load user profile by ID
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) {
        setError('User ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const user = await userService.getUserById(userId)
        setProfileUser(user)
        
        // Set initial follow stats if available
        if (user.followers_count !== undefined) {
          setFollowStats({
            followers_count: user.followers_count,
            following_count: user.following_count || 0
          })
        }
      } catch (err) {
        console.error('Failed to load user profile:', err)
        setError('User not found')
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [userId])

  // Load assigned tickets for representatives
  useEffect(() => {
    const loadAssignedTickets = async () => {
      if (!profileUser?.rep_accounts || profileUser.rep_accounts.length === 0) {
        return
      }

      try {
        setLoadingTickets(true)
        const repIds = profileUser.rep_accounts.map(rep => rep.id)
        const response = await postsService.getAssignedPosts(repIds, { 
          size: 50,
          sort_by: 'created_at',
          order: 'desc'
        })
        setAssignedTickets(response.items)
      } catch (err) {
        console.error('Failed to load assigned tickets:', err)
      } finally {
        setLoadingTickets(false)
      }
    }

    if (profileUser) {
      loadAssignedTickets()
      
      // Auto-select assigned tab if user is a representative and has no posts
      const userPostsCount = posts.filter(post => post.author.id === userId).length
      if (profileUser.rep_accounts && profileUser.rep_accounts.length > 0 && userPostsCount === 0) {
        setActiveTab('assigned')
      }
    }
  }, [profileUser, posts, userId])

  // Check follow status
  useEffect(() => {
    // No follow status checking needed - FollowButton handles this internally
  }, [profileUser, currentUser, userId])

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !profileUser) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go back to feed
          </button>
        </div>
      </div>
    )
  }

  const userPosts = posts.filter(post => post.author.id === userId)
  const totalUpvotes = userPosts.reduce((sum, post) => sum + post.upvotes, 0)
  const totalComments = userPosts.reduce((sum, post) => sum + post.comment_count, 0)
  const totalViews = userPosts.length * 127 // Mock view count
  const isOwnProfile = currentUser?.id === userId
  const joinDate = new Date(2024, 0, 15) // Mock join date

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const handleFollowStatsClick = (type: 'followers' | 'following') => {
    setFollowModalTab(type)
    setShowFollowModal(true)
  }

  const handleFollowChange = (isFollowingNow: boolean, mutual: boolean) => {
    // Update local stats when follow status changes
    setFollowStats(prev => ({
      ...prev,
      followers_count: isFollowingNow ? prev.followers_count + 1 : prev.followers_count - 1
    }))
  }

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profileUser?.display_name || profileUser?.username}'s Profile - CivicPulse`,
        text: `Check out ${profileUser?.display_name || profileUser?.username}'s civic contributions on CivicPulse`,
        url: window.location.href
      }).catch(console.error)
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Profile link copied to clipboard!')
      }).catch(console.error)
    }
  }

  const handleMessage = () => {
    // TODO: Navigate to messaging or open message modal
    console.log('Message user:', profileUser?.username)
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-4 px-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Enhanced Profile Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div 
          className="h-32 rounded-t-lg relative overflow-hidden"
          style={{
            backgroundImage: profileUser?.cover_photo
              ? `url(${profileUser.cover_photo})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 pt-0 pb-4 px-4 relative">
          {/* Avatar */}
          <div className="relative -mt-12 mb-3">
            <div className="relative inline-block">
              <Avatar
                src={profileUser?.avatar_url}
                alt={profileUser?.display_name || profileUser?.username}
                size="2xl"
                className="border-2 border-white shadow-lg"
              />
            </div>
          </div>

          {/* User Details */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profileUser?.display_name || profileUser?.username}</h1>
              {profileUser?.is_verified && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center space-x-1 capitalize">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>{profileUser?.rep_accounts && profileUser.rep_accounts.length > 0 ? 'Representative' : 'Citizen'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>@{profileUser?.username}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Joined {formatJoinDate(joinDate)}</span>
              </span>
            </div>
            
            {/* Representative Account Tags */}
            {profileUser?.rep_accounts && profileUser.rep_accounts.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Representative Accounts</h4>
                  <span className="text-xs text-gray-500">({profileUser.rep_accounts.length})</span>
                </div>
                <RepresentativeAccountTags 
                  repAccounts={profileUser.rep_accounts}
                  maxDisplay={2}
                  size="md"
                  showJurisdiction={true}
                  variant="default"
                />
              </div>
            )}
            
            <p className="text-gray-700 text-sm">
              {profileUser?.bio || "Passionate about making our community better. Let's work together to solve local issues and create positive change! 🏘️✨"}
            </p>

            {/* Follow Stats */}
            <div className="mt-3">
              {profileUser?.id && (
                <FollowStats
                  userId={profileUser.id}
                  onClick={handleFollowStatsClick}
                  className="justify-center"
                  size="md"
                />
              )}
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="text-xl font-bold text-blue-700">{userPosts.length}</div>
              <div className="text-xs text-blue-600 font-medium">Posts</div>
            </div>
            <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="text-xl font-bold text-green-700">{formatNumber(totalUpvotes)}</div>
              <div className="text-xs text-green-600 font-medium">Upvotes</div>
            </div>
            <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="text-xl font-bold text-purple-700">{totalComments}</div>
              <div className="text-xs text-purple-600 font-medium">Comments</div>
            </div>
            <div className="text-center p-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <div className="text-xl font-bold text-orange-700">{formatNumber(totalViews)}</div>
              <div className="text-xs text-orange-600 font-medium">Views</div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex space-x-2">
              <div className="flex-1">
                <FollowButton
                  userId={profileUser?.id || ''}
                  onFollowChange={handleFollowChange}
                  className="w-full"
                />
              </div>
              <button 
                onClick={handleMessage}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button 
                onClick={handleShareProfile}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-xl transition-colors flex items-center justify-center"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-xl transition-colors flex items-center justify-center"
                title="More Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
                  />
                </div>
              ) : profileUser.role_name ? (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium flex items-center space-x-1">
                  <span>{profileUser.role_name}</span>
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  Citizen
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{profileUser.bio}</p>
          </div>
          {isOwnProfile && (
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Edit className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Stats with Follow Stats */}
        <div className="mb-4">
          <FollowStats
            userId={userId!}
            initialStats={{
              followers_count: profileUser.followers_count || 0,
              following_count: profileUser.following_count || 0
            }}
            onClick={handleFollowStatsClick}
            className="justify-center"
            size="md"
          />
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex space-x-3 mb-4">
            <FollowButton
              userId={userId!}
              className="flex-1"
              context="profile"
              onFollowChange={handleFollowChange}
            />
          </div>
        )}

        {/* Additional Stats */}
        <div className={`grid gap-4 ${profileUser.rep_accounts && profileUser.rep_accounts.length > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{userPosts.length}</div>
            <div className="text-xs text-gray-600">Posts</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{totalUpvotes}</div>
            <div className="text-xs text-gray-600">Upvotes</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">{totalComments}</div>
            <div className="text-xs text-gray-600">Comments</div>
          </div>
          {profileUser.rep_accounts && profileUser.rep_accounts.length > 0 && (
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{assignedTickets.length}</div>
              <div className="text-xs text-gray-600">Assigned</div>
            </div>
          )}
        </div>
      </div>

      {/* Posts and Assigned Tickets Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'posts'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Posts ({userPosts.length})</span>
          </button>
          
          {profileUser.rep_accounts && profileUser.rep_accounts.length > 0 && (
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'assigned'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Assigned Tickets ({assignedTickets.length})</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              {isOwnProfile ? 'Your Posts' : `${profileUser.display_name}'s Posts`}
            </h2>
            
            <div className="space-y-3">
              {userPosts.map((post) => (
                <div key={post.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm mb-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{post.upvotes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.comment_count}</span>
                        </span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.post_type === 'issue' ? 'bg-red-100 text-red-800' :
                        post.post_type === 'announcement' ? 'bg-blue-100 text-blue-800' :
                        post.post_type === 'news' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {post.post_type}
                      </span>
                      {post.status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                          post.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {post.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {userPosts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assigned' && profileUser.rep_accounts && profileUser.rep_accounts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Assigned Tickets
            </h2>
            
            {loadingTickets ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading assigned tickets...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">
                          {ticket.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {ticket.content}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{ticket.upvotes}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{ticket.comment_count}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>by {ticket.author.display_name || ticket.author.username}</span>
                          </span>
                          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.post_type === 'issue' ? 'bg-red-100 text-red-800' :
                          ticket.post_type === 'announcement' ? 'bg-blue-100 text-blue-800' :
                          ticket.post_type === 'news' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {ticket.post_type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                          ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {assignedTickets.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No assigned tickets yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Follow Modal */}
      <FollowModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={userId!}
        initialTab={followModalTab}
        userName={profileUser.display_name || profileUser.username}
      />
    </div>
  )
}
