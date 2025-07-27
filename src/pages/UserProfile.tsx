import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, Edit, MessageCircle, TrendingUp } from 'lucide-react'
import { usePosts } from '../contexts/PostContext'
import { useUser } from '../contexts/UserContext'
import Avatar from '../components/Avatar'

export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { posts } = usePosts()
  const { user: currentUser } = useUser()

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

  const handleFollowUser = () => {
    console.log('Following user:', profileUser.display_name)
    alert(`You are now following ${profileUser.display_name}!`)
  }

  const handleSendMessage = () => {
    console.log('Sending message to:', profileUser.display_name)
    alert('Messaging feature coming soon!')
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
            <div className="flex items-center space-x-2 mb-2">
              {/* Use rep_accounts info first, fallback to role_name/abbreviation */}
              {(profileUser.rep_accounts && profileUser.rep_accounts.length > 0) ? (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium flex items-center space-x-1">
                  {profileUser.rep_accounts[0].title.abbreviation && (
                    <span className="font-bold">{profileUser.rep_accounts[0].title.abbreviation}</span>
                  )}
                  <span>{profileUser.rep_accounts[0].title.title_name}</span>
                  <span className="text-primary-600">•</span>
                  <span className="text-primary-600">{profileUser.rep_accounts[0].jurisdiction.name}</span>
                </span>
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

        {/* Stats */}
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

      {/* Contact/Follow Actions (for other users) */}
      {!isOwnProfile && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex space-x-3">
            <button 
              onClick={handleFollowUser}
              className="flex-1 btn-primary"
            >
              Follow Updates
            </button>
            <button 
              onClick={handleSendMessage}
              className="flex-1 btn-secondary"
            >
              Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
