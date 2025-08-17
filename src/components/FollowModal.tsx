import { useState, useEffect } from 'react'
import { X, Users, UserCheck, Loader2 } from 'lucide-react'
import { followService } from '../services/follows'
import { FollowUser, PaginatedResponse } from '../types'
import Avatar from './Avatar'
import FollowButton from './FollowButton'
import { useUser } from '../contexts/UserContext'

interface FollowModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  initialTab: 'followers' | 'following'
  userName?: string
}

export default function FollowModal({
  isOpen,
  onClose,
  userId,
  initialTab,
  userName
}: FollowModalProps) {
  const { user: currentUser } = useUser()
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab)
  const [followers, setFollowers] = useState<FollowUser[]>([])
  const [following, setFollowing] = useState<FollowUser[]>([])
  const [followersPage, setFollowersPage] = useState(1)
  const [followingPage, setFollowingPage] = useState(1)
  const [followersHasMore, setFollowersHasMore] = useState(true)

  // Early return if modal is not open or userId is invalid
  if (!isOpen || !userId || userId === 'undefined' || userId === '') {
    return null
  }
  const [followingHasMore, setFollowingHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Reset state when modal opens or userId changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setFollowers([])
      setFollowing([])
      setFollowersPage(1)
      setFollowingPage(1)
      setFollowersHasMore(true)
      setFollowingHasMore(true)
      loadInitialData()
    }
  }, [isOpen, userId, initialTab])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      
      if (initialTab === 'followers') {
        await loadFollowers(1, true)
      } else {
        await loadFollowing(1, true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadFollowers = async (page: number = 1, reset: boolean = false) => {
    if (!userId || userId === 'undefined' || userId === '') return
    
    try {
      if (!reset) setIsLoadingMore(true)
      
      const response: PaginatedResponse<FollowUser> = await followService.getFollowers(userId, page, 20)
      
      if (reset) {
        setFollowers(response.items)
      } else {
        setFollowers(prev => [...prev, ...response.items])
      }
      
      setFollowersHasMore(response.has_more)
      setFollowersPage(page)
    } catch (error) {
      console.error('Failed to load followers:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const loadFollowing = async (page: number = 1, reset: boolean = false) => {
    if (!userId || userId === 'undefined' || userId === '') return
    
    try {
      if (!reset) setIsLoadingMore(true)
      
      const response: PaginatedResponse<FollowUser> = await followService.getFollowing(userId, page, 20)
      
      if (reset) {
        setFollowing(response.items)
      } else {
        setFollowing(prev => [...prev, ...response.items])
      }
      
      setFollowingHasMore(response.has_more)
      setFollowingPage(page)
    } catch (error) {
      console.error('Failed to load following:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleTabChange = async (tab: 'followers' | 'following') => {
    setActiveTab(tab)
    
    if (tab === 'followers' && followers.length === 0) {
      await loadFollowers(1, true)
    } else if (tab === 'following' && following.length === 0) {
      await loadFollowing(1, true)
    }
  }

  const handleLoadMore = async () => {
    if (isLoadingMore) return
    
    if (activeTab === 'followers' && followersHasMore) {
      await loadFollowers(followersPage + 1)
    } else if (activeTab === 'following' && followingHasMore) {
      await loadFollowing(followingPage + 1)
    }
  }

  const handleFollowChange = (targetUserId: string, isFollowing: boolean) => {
    // Update the follow status in both lists
    setFollowers(prev => prev.map(user => 
      user.id === targetUserId 
        ? { ...user, /* Note: We don't track follow status in the list currently */ }
        : user
    ))
    
    setFollowing(prev => prev.map(user => 
      user.id === targetUserId 
        ? { ...user, /* Note: We don't track follow status in the list currently */ }
        : user
    ))
  }

  if (!isOpen) return null

  const currentList = activeTab === 'followers' ? followers : following
  const currentHasMore = activeTab === 'followers' ? followersHasMore : followingHasMore

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {userName ? `${userName}'s ` : ''}
            {activeTab === 'followers' ? 'Followers' : 'Following'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('followers')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'followers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Followers</span>
            </div>
          </button>
          <button
            onClick={() => handleTabChange('following')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'following'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Following</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">
                {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </div>
              <div className="text-sm text-gray-400">
                {activeTab === 'followers' 
                  ? 'When people follow this user, they\'ll appear here'
                  : 'When this user follows people, they\'ll appear here'
                }
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {currentList.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar
                        src={user.avatar_url}
                        alt={user.display_name || user.username}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {user.display_name || user.username}
                          </h3>
                          {user.is_verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                          {user.mutual && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              Mutual
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        <p className="text-xs text-gray-400">
                          Followed {new Date(user.followed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>                                    <div className="ml-3">
                    <FollowButton
                      userId={user.id}
                      size="sm"
                      onFollowChange={(isFollowing) => handleFollowChange(user.id, isFollowing)}
                      initialFollowStatus={activeTab === 'following' ? true : undefined}
                      context="profile"
                    />
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {currentHasMore && (
                <div className="p-4 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      'Load more'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
