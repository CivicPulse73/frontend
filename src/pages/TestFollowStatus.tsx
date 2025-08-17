import React, { useEffect, useState } from 'react'
import { postsService } from '../services/posts'
import { userService } from '../services/users'
import FollowButton from '../components/FollowButton'

const TestFollowStatus: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [apiCalls, setApiCalls] = useState<string[]>([])

  // Monitor network requests
  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = function(...args) {
      const url = args[0] as string
      if (url.includes('/api/v1/')) {
        setApiCalls(prev => [...prev, `${new Date().toLocaleTimeString()}: ${url}`])
      }
      return originalFetch.apply(this, args)
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  useEffect(() => {
    loadTestData()
  }, [])

  const loadTestData = async () => {
    try {
      console.log('Loading test data...')
      
      // Test posts with follow status
      const postsResponse = await postsService.getPosts({
        page: 1,
        size: 3,
        include_follow_status: true
      })
      setPosts(postsResponse.items)
      
      // Test user profiles with follow status
      if (postsResponse.items.length > 0) {
        const userIds = postsResponse.items.map(post => post.author.id).slice(0, 2)
        const userPromises = userIds.map(id => userService.getUserById(id, true))
        const usersData = await Promise.all(userPromises)
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Failed to load test data:', error)
    }
  }

  const clearApiCalls = () => {
    setApiCalls([])
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Follow Status Integration Test</h1>
      
      {/* API Calls Monitor */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Network Requests Monitor</h2>
          <button 
            onClick={clearApiCalls}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Clear
          </button>
        </div>
        <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
          {apiCalls.length === 0 ? (
            <p className="text-gray-500">No API calls recorded</p>
          ) : (
            apiCalls.map((call, index) => (
              <div key={index} className={`p-1 rounded ${
                call.includes('follow-status') ? 'bg-red-200 text-red-800' : 'bg-white'
              }`}>
                {call}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Posts Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Posts with Follow Status</h2>
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="border p-4 rounded-lg">
              <h3 className="font-medium">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-2">By: {post.author.display_name}</p>
              <div className="text-xs text-gray-500 mb-2">
                Follow Status: is_following={String(post.is_following)}, 
                is_followed_by={String(post.is_followed_by)}, 
                follow_mutual={String(post.follow_mutual)}
              </div>
              <FollowButton
                userId={post.author.id}
                initialFollowStatus={post.is_following}
                initialMutualStatus={post.follow_mutual}
                context="feed"
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Users Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">User Profiles with Follow Status</h2>
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} className="border p-4 rounded-lg">
              <h3 className="font-medium">{user.display_name}</h3>
              <p className="text-sm text-gray-600 mb-2">@{user.username}</p>
              <div className="text-xs text-gray-500 mb-2">
                Follow Status: is_following={String(user.is_following)}, 
                is_followed_by={String(user.is_followed_by)}, 
                follow_mutual={String(user.follow_mutual)}
              </div>
              <FollowButton
                userId={user.id}
                initialFollowStatus={user.is_following}
                initialMutualStatus={user.follow_mutual}
                context="profile"
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Check that follow buttons appear without making follow-status API calls</li>
          <li>• Any red-highlighted requests in the monitor indicate problematic follow-status calls</li>
          <li>• Follow/unfollow actions should work without additional API calls for status</li>
          <li>• All follow status should come from main API responses (posts, users)</li>
        </ul>
      </div>
    </div>
  )
}

export default TestFollowStatus
