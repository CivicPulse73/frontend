import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, Filter, User, MapPin, FileText, X, ExternalLink, Calendar, MessageCircle, Heart, Users, CheckCircle } from 'lucide-react'
import { useSearch } from '../hooks/useSearch'
import { SearchResult } from '../services/search'

const filterTypes = [
  { id: 'all', label: 'All', icon: Filter },
  { id: 'post', label: 'Posts', icon: FileText },
  { id: 'user', label: 'Users', icon: User },
  { id: 'location', label: 'Locations', icon: MapPin },
] as const

type FilterType = 'all' | 'post' | 'user' | 'location'

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const { results, loading, error, total, search, clear } = useSearch()

  // Search when query or filter changes
  useEffect(() => {
    if (query.trim()) {
      const filters = activeFilter === 'all' ? undefined : { type: activeFilter as 'post' | 'user' | 'location' }
      search(query, filters)
    } else {
      clear()
    }
  }, [query, activeFilter, search, clear])

  // Update URL when query changes
  useEffect(() => {
    if (query.trim()) {
      setSearchParams({ q: query })
    } else {
      setSearchParams({})
    }
  }, [query, setSearchParams])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleClearSearch = () => {
    setQuery('')
    clear()
  }

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'post':
        navigate(`/post/${result.id}`)
        break
      case 'user':
        navigate(`/profile/${result.id}`)
        break
      case 'location':
        navigate(`/representative/${result.id}`)
        break
    }
  }

  const renderPostResult = (result: SearchResult) => {
    const metadata = result.metadata || {}
    return (
      <div 
        key={result.id} 
        onClick={() => handleResultClick(result)}
        className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-4">
          {result.imageUrl && (
            <img 
              src={result.imageUrl} 
              alt={result.title}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0 group-hover:shadow-md transition-shadow"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                <FileText className="w-3 h-3 mr-1" />
                Post
              </span>
              {metadata.status && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  metadata.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  metadata.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {metadata.status.replace('_', ' ')}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {result.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {result.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {metadata.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{metadata.location}</span>
                </div>
              )}
              {metadata.upvotes !== undefined && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{metadata.upvotes} votes</span>
                </div>
              )}
              {metadata.created_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(metadata.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    )
  }

  const renderUserResult = (result: SearchResult) => {
    const metadata = result.metadata || {}
    return (
      <div 
        key={result.id} 
        onClick={() => handleResultClick(result)}
        className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img 
              src={result.imageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400`} 
              alt={result.title}
              className="w-16 h-16 rounded-full object-cover group-hover:shadow-md transition-shadow"
            />
            {metadata.verified && (
              <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <User className="w-3 h-3 mr-1" />
                User
              </span>
              {metadata.role && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {metadata.role}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
              {result.title}
            </h3>
            {metadata.username && (
              <p className="text-gray-500 text-sm mb-2">@{metadata.username}</p>
            )}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {result.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {metadata.followers !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{metadata.followers} followers</span>
                </div>
              )}
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
        </div>
      </div>
    )
  }

  const renderLocationResult = (result: SearchResult) => {
    const metadata = result.metadata || {}
    return (
      <div 
        key={result.id} 
        onClick={() => handleResultClick(result)}
        className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-4">
          {result.imageUrl && (
            <img 
              src={result.imageUrl} 
              alt={result.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0 group-hover:shadow-md transition-shadow"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                <MapPin className="w-3 h-3 mr-1" />
                Representative
              </span>
              {metadata.party && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {metadata.party}
                </span>
              )}
              {metadata.verified && (
                <CheckCircle className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
              {result.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {result.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {metadata.constituency && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{metadata.constituency}</span>
                </div>
              )}
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
        </div>
      </div>
    )
  }

  const renderSearchResult = (result: SearchResult) => {
    switch (result.type) {
      case 'post':
        return renderPostResult(result)
      case 'user':
        return renderUserResult(result)
      case 'location':
        return renderLocationResult(result)
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600">Find posts, users, and locations</p>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search posts, usernames, areas, or topics..."
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterTypes.map((filter) => {
              const Icon = filter.icon
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Results */}
        <div>
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Searching...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}

          {!loading && !error && query && results.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Found <span className="font-semibold text-blue-600">{total}</span> results for <span className="font-medium">"{query}"</span>
                  </p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    {activeFilter !== 'all' && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Filtered by: {activeFilter}
                      </span>
                    )}
                  </div>
                </div>
                {results.length > 0 && (
                  <div className="mt-3 flex gap-4 text-sm text-gray-500">
                    <span>Posts: {results.filter(r => r.type === 'post').length}</span>
                    <span>Users: {results.filter(r => r.type === 'user').length}</span>
                    <span>Representatives: {results.filter(r => r.type === 'location').length}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {results.map(renderSearchResult)}
              </div>
            </>
          )}

          {!query && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">Discover CivicPulse</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Search for posts about local issues, find community members, or explore your representatives
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <FileText className="w-8 h-8 text-blue-500 mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">Posts</h4>
                  <p className="text-sm text-gray-600">Find discussions about local issues, events, and community topics</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <User className="w-8 h-8 text-green-500 mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">Users</h4>
                  <p className="text-sm text-gray-600">Connect with community members, activists, and local voices</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <MapPin className="w-8 h-8 text-purple-500 mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">Representatives</h4>
                  <p className="text-sm text-gray-600">Learn about your elected officials and their positions</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}