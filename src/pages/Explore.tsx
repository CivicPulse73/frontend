import { useState, useMemo, useEffect, useRef } from 'react'
import { Filter, Play, MessageCircle, ArrowUp, ArrowDown, Clock, AlertTriangle, CheckCircle2, Megaphone, Trophy, Search, X, MapPin, User, Heart, Bookmark, Share2, ChevronUp, ChevronDown } from 'lucide-react'
import { usePosts } from '../contexts/PostContext'
import { CivicPost } from '../types'

type ExploreFilter = 'all' | 'issue' | 'announcement' | 'accomplishment' | 'news'
type SortOption = 'recent' | 'popular' | 'trending'

interface ExploreCardProps {
  post: CivicPost
  onClick: (post: CivicPost) => void
}

function ExploreCard({ post, onClick }: ExploreCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'issue': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'announcement': return <Megaphone className="w-4 h-4 text-blue-500" />
      case 'accomplishment': return <Trophy className="w-4 h-4 text-green-500" />
      case 'news': return <Clock className="w-4 h-4 text-gray-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'issue': return 'bg-red-100 text-red-700 border-red-200'
      case 'announcement': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'accomplishment': return 'bg-green-100 text-green-700 border-green-200'
      case 'news': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  const getTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}d`
  }

  // Determine card height based on content - improved algorithm
  const getCardHeight = () => {
    const hasMedia = post.image || post.video
    const descLength = post.content.length
    
    if (hasMedia) {
      if (descLength > 200) return 'min-h-[350px]'
      if (descLength > 100) return 'min-h-[300px]'
      return 'min-h-[280px]'
    }
    
    if (descLength > 250) return 'min-h-[220px]'
    if (descLength > 150) return 'min-h-[180px]'
    return 'min-h-[160px]'
  }

  return (
    <div 
      className={`relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer group hover:shadow-lg hover:border-gray-300 transition-all duration-300 ${getCardHeight()}`}
      onClick={() => onClick(post)}
    >
      {/* Media */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
        {post.image && (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        )}
        {post.video && (
          <div className="relative w-full h-full bg-black">
            <video 
              src={post.video}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
              <div className="w-14 h-14 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Play className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        )}
        {!post.image && !post.video && (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-5xl opacity-50">
              {getTypeIcon(post.post_type)}
            </div>
          </div>
        )}

        {/* Enhanced overlay with stats */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between text-white text-sm font-medium">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                  <ArrowUp className="w-4 h-4" />
                  <span>{formatNumber(post.upvotes)}</span>
                </div>
                <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                  <MessageCircle className="w-4 h-4" />
                  <span>{formatNumber(post.comment_count)}</span>
                </div>
              </div>
              <div className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                {getTimestamp(new Date(post.created_at))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced type badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${getTypeColor(post.post_type)}`}>
            {getTypeIcon(post.post_type)}
            <span className="ml-1.5 capitalize">{post.post_type}</span>
          </span>
        </div>

        {/* Enhanced status badge for issues */}
        {post.post_type === 'issue' && post.status && (
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${
              post.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-200' :
              post.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
              'bg-red-100 text-red-700 border-red-200'
            }`}>
              {post.status === 'resolved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
              <span className="capitalize">{post.status.replace('-', ' ')}</span>
            </span>
          </div>
        )}

        {/* User verification badge for representatives */}
        {post.author.role_name === 'representative' && post.author.verified && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-2">
          {post.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-3">
          {post.content}
        </p>
        
        {/* Enhanced footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium truncate">{post.location}</span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <ArrowUp className={`w-3 h-3 ${post.is_upvoted ? 'text-blue-500' : ''}`} />
              <span className={post.is_upvoted ? 'text-blue-600 font-medium' : ''}>{formatNumber(post.upvotes)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{formatNumber(post.comment_count)}</span>
            </div>
            {post.is_saved && (
              <Bookmark className="w-3 h-3 text-yellow-500 fill-current" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Explore() {
  const { posts, loadPosts } = usePosts()
  const [activeFilter, setActiveFilter] = useState<ExploreFilter>('all')
  const [selectedPostIndex, setSelectedPostIndex] = useState<number>(-1)
  const [isDetailViewerOpen, setIsDetailViewerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  // Load posts when component mounts if no posts are available
  useEffect(() => {
    if (posts.length === 0) {
      const filters = {
        post_type: undefined,
        sort_by: 'created_at',
        order: 'desc' as const
      }
      loadPosts(filters, true)
    }
  }, [posts.length, loadPosts])

  // Handle filter changes
  const handleFilterChange = async (filter: ExploreFilter) => {
    setActiveFilter(filter)
    const filters = {
      post_type: filter === 'all' ? undefined : filter,
      sort_by: sortBy === 'recent' ? 'created_at' : sortBy === 'popular' ? 'upvotes' : 'upvotes',
      order: 'desc' as const
    }
    await loadPosts(filters, true)
  }

  // Handle sort changes
  const handleSortChange = async (sort: SortOption) => {
    setSortBy(sort)
    const filters = {
      post_type: activeFilter === 'all' ? undefined : activeFilter,
      sort_by: sort === 'recent' ? 'created_at' : sort === 'popular' ? 'upvotes' : 'upvotes',
      order: 'desc' as const
    }
    await loadPosts(filters, true)
  }

  const filterOptions = [
    { label: 'All', value: 'all' as ExploreFilter, icon: Filter },
    { label: 'Issues', value: 'issue' as ExploreFilter, icon: AlertTriangle },
    { label: 'Announcements', value: 'announcement' as ExploreFilter, icon: Megaphone },
    { label: 'Accomplishments', value: 'accomplishment' as ExploreFilter, icon: Trophy },
    { label: 'News', value: 'news' as ExploreFilter, icon: Clock },
  ]

  const sortOptions = [
    { label: 'Recent', value: 'recent' as SortOption },
    { label: 'Popular', value: 'popular' as SortOption },
    { label: 'Trending', value: 'trending' as SortOption },
  ]

  // Enhanced filtering and sorting with useMemo for performance
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      // Filter by type
      if (activeFilter !== 'all' && post.post_type !== activeFilter) return false
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.location?.toLowerCase().includes(query) ||
          post.author.display_name?.toLowerCase().includes(query) ||
          (post.category && post.category.toLowerCase().includes(query))
        )
      }
      
      return true
    })

    // Sort posts
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.upvotes + b.comment_count) - (a.upvotes + a.comment_count)
        case 'trending':
          // Simple trending algorithm: recent posts with high engagement
          const aScore = (a.upvotes + a.comment_count * 2) / Math.max(1, Math.floor((Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)))
          const bScore = (b.upvotes + b.comment_count * 2) / Math.max(1, Math.floor((Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)))
          return bScore - aScore
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [posts, activeFilter, searchQuery, sortBy])

  const handleCardClick = (post: CivicPost) => {
    const postIndex = filteredAndSortedPosts.findIndex(p => p.id === post.id)
    setSelectedPostIndex(postIndex)
    setIsDetailViewerOpen(true)
  }

  const handleDetailViewerClose = () => {
    setIsDetailViewerOpen(false)
    setSelectedPostIndex(-1)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 pb-20">
        {/* Enhanced Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore</h1>
          <p className="text-gray-600">Discover what's happening in your community</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search posts, areas, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Filter and Sort Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Filter buttons */}
          <div className="flex-1">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
              {filterOptions.map((option) => {
                const Icon = option.icon
                const count = posts.filter(p => option.value === 'all' || p.post_type === option.value).length
                return (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange(option.value)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      activeFilter === option.value
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeFilter === option.value
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sort dropdown */}
          <div className="flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {searchQuery ? (
              <>
                Found <span className="font-semibold">{filteredAndSortedPosts.length}</span> results
                {searchQuery && <> for "<span className="font-medium">{searchQuery}</span>"</>}
              </>
            ) : (
              <>
                Showing <span className="font-semibold">{filteredAndSortedPosts.length}</span> posts
                {activeFilter !== 'all' && <> in <span className="font-medium capitalize">{activeFilter}</span></>}
              </>
            )}
          </p>
        </div>

        {/* Enhanced Content Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filteredAndSortedPosts.map((post) => (
            <div 
              key={post.id}
              className="break-inside-avoid mb-4"
            >
              <ExploreCard
                post={post}
                onClick={handleCardClick}
              />
            </div>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {filteredAndSortedPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {searchQuery ? (
                <Search className="w-10 h-10 text-gray-400" />
              ) : (
                <Filter className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {searchQuery ? 'No results found' : 'No content found'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchQuery ? (
                <>
                  We couldn't find any posts matching "<span className="font-medium">{searchQuery}</span>".
                  Try adjusting your search terms or filters.
                </>
              ) : (
                activeFilter === 'all' 
                  ? "No posts are available at the moment. Check back later for updates."
                  : `No ${activeFilter} posts found. Try selecting a different category.`
              )}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Infinite Scroll Detail Viewer */}
        <InfiniteScrollDetailViewer
          posts={filteredAndSortedPosts}
          initialPostIndex={selectedPostIndex >= 0 ? selectedPostIndex : 0}
          isOpen={isDetailViewerOpen}
          onClose={handleDetailViewerClose}
        />
      </div>
    </div>
  )
}

interface InfiniteScrollDetailViewerProps {
  posts: CivicPost[]
  initialPostIndex: number
  isOpen: boolean
  onClose: () => void
}

function InfiniteScrollDetailViewer({ posts, initialPostIndex, isOpen, onClose }: InfiniteScrollDetailViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialPostIndex)
  const [isSwipeIndicatorVisible, setIsSwipeIndicatorVisible] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const postRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (isOpen) {
      // Show swipe indicator briefly on mobile when first opening
      if (window.innerWidth <= 768) {
        setIsSwipeIndicatorVisible(true)
        const timer = setTimeout(() => {
          setIsSwipeIndicatorVisible(false)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      // Scroll to the initial post when modal opens
      setTimeout(() => {
        postRefs.current[initialPostIndex]?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        })
      }, 100)
    }
  }, [isOpen, initialPostIndex])

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return

      const container = scrollContainerRef.current
      const containerHeight = container.clientHeight
      const containerCenter = containerHeight / 2

      // Find which post is currently in the center of the viewport
      let closestIndex = 0
      let closestDistance = Infinity

      postRefs.current.forEach((ref, index) => {
        if (!ref) return

        const rect = ref.getBoundingClientRect()
        const postCenter = rect.top + rect.height / 2
        const distance = Math.abs(postCenter - containerCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      if (closestIndex !== currentIndex) {
        setCurrentIndex(closestIndex)
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [currentIndex])

  const navigateToPost = (direction: 'up' | 'down') => {
    const newIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(posts.length - 1, currentIndex + 1)
    
    if (newIndex !== currentIndex) {
      // Provide haptic feedback on mobile if available
      if ('vibrate' in navigator && window.innerWidth <= 768) {
        navigator.vibrate(50) // Short vibration for navigation feedback
      }
      
      postRefs.current[newIndex]?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      })
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        navigateToPost('up')
        break
      case 'ArrowDown':
        e.preventDefault()
        navigateToPost('down')
        break
      case 'Escape':
        onClose()
        break
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, currentIndex])

  // Enhanced touch handling for mobile swipe navigation
  const [touchStart, setTouchStart] = useState<{ y: number; time: number } | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(null)
  const [pullToCloseDistance, setPullToCloseDistance] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ 
      y: touch.clientY,
      time: Date.now()
    })
    setSwipeDirection(null)
    setPullToCloseDistance(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return
    
    const touch = e.touches[0]
    const deltaY = touch.clientY - touchStart.y
    const absDeltaY = Math.abs(deltaY)
    
    // Check for pull-to-close gesture at the top
    const container = scrollContainerRef.current
    const isAtTop = container && container.scrollTop <= 5
    
    if (isAtTop && deltaY > 0 && touch.clientY < 200) {
      // User is pulling down from the top - show pull-to-close feedback
      setPullToCloseDistance(Math.min(deltaY, 150))
      e.preventDefault()
    } else {
      setPullToCloseDistance(0)
    }
    
    // Determine swipe direction for potential navigation
    if (absDeltaY > 50 && !swipeDirection) {
      setSwipeDirection(deltaY > 0 ? 'down' : 'up')
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) {
      setTouchStart(null)
      setSwipeDirection(null)
      setPullToCloseDistance(0)
      return
    }

    const touch = e.changedTouches[0]
    const deltaY = touchStart.y - touch.clientY
    const deltaTime = Date.now() - touchStart.time
    const minSwipeDistance = 100
    const maxSwipeTime = 600
    const minSwipeVelocity = 0.3

    // Check for pull-to-close gesture
    if (pullToCloseDistance > 80) {
      onClose()
      setPullToCloseDistance(0)
      setTouchStart(null)
      setSwipeDirection(null)
      return
    }

    const velocity = Math.abs(deltaY) / deltaTime

    // Check if it's at the edge of scrollable content
    const container = scrollContainerRef.current
    const isAtTop = container && container.scrollTop <= 10
    const isAtBottom = container && container.scrollTop >= container.scrollHeight - container.clientHeight - 10

    // Only trigger navigation if:
    // 1. It's a quick, intentional swipe with good velocity
    // 2. The swipe distance is significant
    // 3. User is at the edge of the scrollable content or it's a very fast swipe
    const shouldNavigate = Math.abs(deltaY) > minSwipeDistance && 
                          deltaTime < maxSwipeTime && 
                          velocity > minSwipeVelocity &&
                          (velocity > 0.8 || (deltaY > 0 && isAtTop) || (deltaY < 0 && isAtBottom))

    if (shouldNavigate) {
      e.preventDefault()
      if (deltaY > 0) {
        // Swiped up - go to next post
        navigateToPost('down')
      } else {
        // Swiped down - go to previous post
        navigateToPost('up')
      }
    }

    setTouchStart(null)
    setSwipeDirection(null)
    setPullToCloseDistance(0)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'issue': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'announcement': return <Megaphone className="w-5 h-5 text-blue-500" />
      case 'accomplishment': return <Trophy className="w-5 h-5 text-green-500" />
      case 'news': return <Clock className="w-5 h-5 text-gray-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'issue': return 'bg-red-100 text-red-700 border-red-200'
      case 'announcement': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'accomplishment': return 'bg-green-100 text-green-700 border-green-200'
      case 'news': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  const getTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Navigation sidebar - Desktop only */}
      <div className="hidden lg:flex flex-col items-center justify-center w-16 bg-black bg-opacity-50 backdrop-blur-sm">
        <button
          onClick={() => navigateToPost('up')}
          disabled={currentIndex === 0}
          className="p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col space-y-1 mb-4 max-h-40 overflow-y-auto">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                postRefs.current[index]?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'center'
                })
              }}
              className={`w-2 h-8 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-30 hover:bg-opacity-50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => navigateToPost('down')}
          disabled={currentIndex === posts.length - 1}
          className="p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 relative">
        {/* Mobile-optimized Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black via-black/70 to-transparent">
          {/* Pull-to-close indicator */}
          {pullToCloseDistance > 0 && (
            <div 
              className="lg:hidden absolute top-2 left-1/2 transform -translate-x-1/2 transition-all duration-200"
              style={{ 
                transform: `translateX(-50%) translateY(${Math.min(pullToCloseDistance / 2, 20)}px)`,
                opacity: Math.min(pullToCloseDistance / 80, 1)
              }}
            >
              <div className="w-12 h-1 bg-white rounded-full opacity-60"></div>
              <div className="text-white text-xs mt-1 text-center">
                {pullToCloseDistance > 60 ? 'Release to close' : 'Pull to close'}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between p-4 safe-area-top">
            <div className="flex items-center space-x-3 text-white">
              <h2 className="text-base md:text-lg font-semibold">
                {currentIndex + 1} of {posts.length}
              </h2>
              <span className="text-xs md:text-sm opacity-75 hidden sm:block">
                Swipe or use ↑↓ arrows
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-3 md:p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200 touch-manipulation"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Mobile navigation indicators */}
          <div className="flex lg:hidden justify-center pb-2">
            <div className="flex items-center space-x-1 bg-black bg-opacity-30 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="flex space-x-1 max-w-32 overflow-hidden">
                {posts.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, relativeIndex) => {
                  const actualIndex = Math.max(0, currentIndex - 2) + relativeIndex
                  return (
                    <div
                      key={actualIndex}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        actualIndex === currentIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white bg-opacity-40'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mobile swipe hint */}
          {isSwipeIndicatorVisible && (
            <div className="lg:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm animate-pulse">
              Swipe up/down to navigate
            </div>
          )}
        </div>

        {/* Mobile navigation buttons */}
        <div className="lg:hidden absolute top-1/2 left-4 right-4 z-10 flex justify-between pointer-events-none transform -translate-y-1/2">
          <button
            onClick={() => navigateToPost('up')}
            disabled={currentIndex === 0}
            className="p-4 text-white bg-black bg-opacity-40 backdrop-blur-sm hover:bg-opacity-60 rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed pointer-events-auto touch-manipulation"
            aria-label="Previous post"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigateToPost('down')}
            disabled={currentIndex === posts.length - 1}
            className="p-4 text-white bg-black bg-opacity-40 backdrop-blur-sm hover:bg-opacity-60 rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed pointer-events-auto touch-manipulation"
            aria-label="Next post"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable posts container with improved mobile handling */}
        <div 
          ref={scrollContainerRef}
          className="h-full overflow-y-auto snap-y snap-mandatory infinite-scroll-container overscroll-y-contain"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y'
          }}
        >
          {posts.map((post, index) => (
            <div
              key={post.id}
              ref={(el) => (postRefs.current[index] = el)}
              className="min-h-screen w-full snap-center flex items-center justify-center p-3 md:p-4"
            >
              <div className="max-w-4xl w-full bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-2xl mx-auto">
                {/* Mobile-optimized Post header */}
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {post.author.avatar_url ? (
                          <img 
                            src={post.author.avatar_url} 
                            alt={post.author.display_name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <User className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{post.author.display_name}</h3>
                          {post.author.verified && (
                            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-500">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate">{post.location}</span>
                          <span>•</span>
                          <span className="whitespace-nowrap">{getTimestamp(new Date(post.created_at))}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-semibold border ${getTypeColor(post.post_type)}`}>
                        {getTypeIcon(post.post_type)}
                        <span className="ml-1 md:ml-2 capitalize">{post.post_type}</span>
                      </span>
                      {post.post_type === 'issue' && post.status && (
                        <span className={`inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-semibold border ${
                          post.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-200' :
                          post.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {post.status === 'resolved' && <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />}
                          <span className="capitalize">{post.status.replace('-', ' ')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 leading-tight">{post.title}</h1>
                </div>

                {/* Mobile-optimized Post media */}
                {(post.image || post.video) && (
                  <div className="relative bg-gray-100">
                    {post.image && (
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-64 md:h-96 object-cover"
                      />
                    )}
                    {post.video && (
                      <div className="relative">
                        <video 
                          src={post.video}
                          className="w-full h-64 md:h-96 object-cover"
                          controls
                          preload="metadata"
                          playsInline
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile-optimized Post content */}
                <div className="p-4 md:p-6">
                  <p className="text-gray-700 leading-relaxed text-sm md:text-lg mb-4 md:mb-6">
                    {post.content}
                  </p>

                  {/* Mobile-optimized Engagement section */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 md:pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4 md:space-x-6">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 touch-manipulation">
                        <ArrowUp className={`w-5 h-5 md:w-6 md:h-6 ${post.is_upvoted ? 'text-blue-500 fill-current' : ''}`} />
                        <span className={`font-semibold text-sm md:text-base ${post.is_upvoted ? 'text-blue-600' : ''}`}>
                          {formatNumber(post.upvotes)}
                        </span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200 touch-manipulation">
                        <ArrowDown className={`w-5 h-5 md:w-6 md:h-6 ${post.is_downvoted ? 'text-red-500 fill-current' : ''}`} />
                        <span className={`font-semibold text-sm md:text-base ${post.is_downvoted ? 'text-red-600' : ''}`}>
                          {formatNumber(post.downvotes)}
                        </span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 touch-manipulation">
                        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="font-semibold text-sm md:text-base">{formatNumber(post.comment_count)}</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end space-x-2 md:space-x-3">
                      <button className="p-2 md:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 touch-manipulation">
                        <Heart className={`w-5 h-5 md:w-6 md:h-6 ${post.is_upvoted ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                      </button>
                      <button className="p-2 md:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 touch-manipulation">
                        <Bookmark className={`w-5 h-5 md:w-6 md:h-6 ${post.is_saved ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                      </button>
                      <button className="p-2 md:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 touch-manipulation">
                        <Share2 className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile-optimized Comments preview */}
                  {post.comment_count > 0 && (
                    <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">
                        Comments ({post.comment_count})
                      </h4>
                      <div className="space-y-3 md:space-y-4 max-h-32 md:max-h-40 overflow-y-auto">
                        <div className="text-sm text-gray-500 italic">
                          {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'} - Click to view
                        </div>
                      </div>
                      {post.comment_count > 0 && (
                        <button className="text-blue-600 text-xs md:text-sm font-medium mt-2 md:mt-3 hover:text-blue-700 touch-manipulation">
                          View all {post.comment_count} comments
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
