import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Settings, Edit, MessageCircle, TrendingUp } from 'lucide-react'
import { usePosts } from '../contexts/PostContext'
import { useUser } from '../contexts/UserContext'
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
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers')
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 })

  // Find the user from posts (in a real app, this would be from a user API)
  const profileUser = posts.find(post => post.author.id === userId)?.author

  if (!profileUser) {
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
  const isOwnProfile = currentUser?.id === userId

  const handleSendMessage = () => {
    console.log('Sending message to:', profileUser.display_name)
    alert('Messaging feature coming soon!')
  }

  const handleFollowStatsClick = (type: 'followers' | 'following') => {
    setFollowModalTab(type)
    setShowFollowModal(true)
  }

  const handleFollowChange = (isFollowing: boolean, mutual: boolean) => {
    // Update local stats when follow status changes
    setFollowStats(prev => ({
      ...prev,
      followers_count: isFollowing ? prev.followers_count + 1 : prev.followers_count - 1
    }))
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        {isOwnProfile && (
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar
            src={profileUser.avatar_url}
            alt={profileUser.display_name || profileUser.username}
            size="2xl"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-2xl font-semibold text-gray-900">{profileUser.display_name || profileUser.username}</h1>
              {profileUser.verified && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>
            <div className="mb-2">
              {/* Representative Account Tags */}
              {profileUser.rep_accounts && profileUser.rep_accounts.length > 0 ? (
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Representative Accounts</h4>
                    <span className="text-xs text-gray-500">({profileUser.rep_accounts.length})</span>
                  </div>
                  <RepresentativeAccountTags 
                    repAccounts={profileUser.rep_accounts}
                    maxDisplay={3}
                    size="md"
                    showJurisdiction={true}
                  />
                </div>
              ) : profileUser.role_name ? (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium flex items-center space-x-1">
                  {profileUser.abbreviation && (
                    <span className="font-bold">{profileUser.abbreviation}</span>
                  )}
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
              onFollowChange={handleFollowChange}
            />
            <button
              onClick={handleSendMessage}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </button>
          </div>
        )}

        {/* Additional Stats */}
        <div className="grid grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* User's Posts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          {isOwnProfile ? 'Your Posts' : `${profileUser.display_name}'s Posts`} ({userPosts.length})
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
