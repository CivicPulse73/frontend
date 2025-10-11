import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, MessageCircle, TrendingUp, FileText, Users, MapPin, Calendar, Share2, MoreHorizontal } from 'lucide-react'
import { usePosts } from '../contexts/PostContext'
import { useUser } from '../contexts/UserContext'
import { userService, UserStats } from '../services/users'
import { postsService } from '../services/posts'
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
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers')
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 })
  const [assignedTickets, setAssignedTickets] = useState<CivicPost[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'assigned'>('posts')

  const computeUserStats = (targetUserId: string): UserStats => {
    const userPostsForStats = posts.filter(post => post.author.id === targetUserId)
    return {
      posts_count: userPostsForStats.length,
      comments_received: userPostsForStats.reduce((sum, post) => sum + post.comment_count, 0),
      upvotes_received: userPostsForStats.reduce((sum, post) => sum + post.upvotes, 0),
      total_views: userPostsForStats.length * 127
    }
  }

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
        setUserStats(computeUserStats(userId))
        
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

  useEffect(() => {
    if (!userId) return
    setUserStats(computeUserStats(userId))
  }, [userId, posts])

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

  // Loading state
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

  // Error state
  if (error || !profileUser) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  const userPosts = posts.filter(post => post.author.id === userId)
  
  // Use API stats with fallback to manual calculation
  const totalUpvotes = userStats?.upvotes_received ?? userPosts.reduce((sum, post) => sum + post.upvotes, 0)
  const totalComments = userStats?.comments_received ?? userPosts.reduce((sum, post) => sum + post.comment_count, 0)
  const totalViews = userStats?.total_views ?? (userPosts.length * 127) // Fallback to mock view count
  const postsCount = userStats?.posts_count ?? userPosts.length
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
        title: `${profileUser.display_name || profileUser.username}'s Profile - CivicPulse`,
        text: `Check out ${profileUser.display_name || profileUser.username}'s civic contributions on CivicPulse`,
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
    console.log('Message user:', profileUser.username)
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
            backgroundImage: profileUser.cover_photo
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
                src={profileUser.avatar_url}
                alt={profileUser.display_name || profileUser.username}
                size="2xl"
                className="border-2 border-white shadow-lg"
              />
            </div>
          </div>

          {/* User Details */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profileUser.display_name || profileUser.username}</h1>
              {profileUser.verified && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center space-x-1 capitalize">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>{profileUser.rep_accounts && profileUser.rep_accounts.length > 0 ? 'Representative' : 'Citizen'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>@{profileUser.username}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Joined {formatJoinDate(joinDate)}</span>
              </span>
            </div>
            
            {/* Representative Account Tags */}
            {profileUser.rep_accounts && profileUser.rep_accounts.length > 0 && (
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
              {profileUser.bio || "Passionate about making our community better. Let's work together to solve local issues and create positive change! 🏘️✨"}
            </p>

            {/* Follow Stats */}
            <div className="mt-3">
              <FollowStats
                userId={profileUser.id}
                onClick={handleFollowStatsClick}
                className="justify-center"
                size="md"
              />
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="text-xl font-bold text-blue-700">{postsCount}</div>
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
                  userId={profileUser.id}
                  onFollowChange={handleFollowChange}
                  className="w-full"
                  initialFollowStatus={profileUser.is_following}
                  initialMutualStatus={profileUser.follow_mutual}
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

      {/* Content Tabs */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="p-4 pb-3">
          <div className="flex space-x-2 mb-4 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'posts' 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Posts</span>
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full ml-1">
                {postsCount}
              </span>
            </button>
            
            {/* Conditionally show Assigned tab if user has rep_accounts */}
            {profileUser.rep_accounts && profileUser.rep_accounts.length > 0 && (
              <button
                onClick={() => {
                  setActiveTab('assigned')
                  if (activeTab !== 'assigned') {
                    // Trigger loading of assigned posts
                  }
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'assigned' 
                    ? 'bg-white text-primary-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Assigned</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-1">
                  {assignedTickets.length}
                </span>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-3">
                {userPosts.map((post) => (
                  <div key={post.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{post.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                        post.post_type === 'issue' ? 'bg-red-100 text-red-800' :
                        post.post_type === 'announcement' ? 'bg-blue-100 text-blue-800' :
                        post.post_type === 'news' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {post.post_type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{post.upvotes} upvotes</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.comment_count} comments</span>
                        </span>
                      </div>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                
                {userPosts.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No posts yet</p>
                    <p className="text-gray-400 text-xs">Posts will appear here when this user shares something</p>
                  </div>
                )}
              </div>
            )}

            {/* Assigned Posts Tab */}
            {activeTab === 'assigned' && (
              <div className="space-y-3">
                {loadingTickets ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading assigned posts...</p>
                  </div>
                ) : (
                  <>
                    {assignedTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{ticket.title}</h3>
                          <div className="flex flex-col space-y-1 ml-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-center ${
                              ticket.post_type === 'issue' ? 'bg-red-100 text-red-800' :
                              ticket.post_type === 'announcement' ? 'bg-blue-100 text-blue-800' :
                              ticket.post_type === 'news' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {ticket.post_type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-center ${
                              ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                              ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{ticket.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{ticket.upvotes} upvotes</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>by {ticket.author.display_name || ticket.author.username}</span>
                            </span>
                          </div>
                          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    
                    {assignedTickets.length === 0 && (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No assigned posts yet</p>
                        <p className="text-gray-400 text-xs">Posts assigned to this representative will appear here</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
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
