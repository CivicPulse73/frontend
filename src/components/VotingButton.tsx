import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { evotesService } from '../services/evotes'

interface VotingButtonProps {
  userId: string
  className?: string
}

export default function VotingButton({ userId, className = '' }: VotingButtonProps) {
  const [hasVoted, setHasVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auto-clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [error])

  // Format numbers for display (e.g., 1200 -> 1.2k)
  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Check initial vote status and get total count
  useEffect(() => {
    const getInitialState = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch both status and trends data in parallel
        const [status, trends] = await Promise.all([
          evotesService.checkEvoteStatus(userId),
          evotesService.getRepresentativeEvoteTrends(userId, 1) // Only need current total
        ])
        setHasVoted(status.has_evoted)
        setVoteCount(trends.current_total)
      } catch (err) {
        console.error('Failed to check vote status:', err)
        setHasVoted(false)
        setVoteCount(0)
        setError('Could not load vote data')
      } finally {
        setIsLoading(false)
      }
    }

    getInitialState()
  }, [userId])

  const handleVoteToggle = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    setError(null)
    
    // Optimistic UI update
    const originalVoteState = hasVoted
    const originalVoteCount = voteCount
    
    setHasVoted(!originalVoteState)
    setVoteCount(prev => originalVoteState ? prev - 1 : prev + 1)

    try {
      let result
      if (originalVoteState) {
        result = await evotesService.removeEvote(userId)
      } else {
        result = await evotesService.castEvote(userId)
      }
      
      // Update with actual server response
      setHasVoted(result.has_evoted)
      setVoteCount(result.total_evotes)
      
    } catch (err) {
      console.error('Failed to toggle vote:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vote'
      setError(errorMessage)
      
      // Rollback on error
      setHasVoted(originalVoteState)
      setVoteCount(originalVoteCount)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleVoteToggle}
      disabled={isLoading}
      className={`
        group flex flex-col items-center justify-center transition-all duration-200 py-2 px-3 rounded-lg
        hover:bg-blue-50 hover:shadow-sm cursor-pointer
        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
      title={hasVoted ? 'Remove your vote' : 'Vote for this representative'}
      aria-pressed={hasVoted}
      aria-label={hasVoted ? `Remove vote (${formatCount(voteCount)} total votes)` : `Cast vote (${formatCount(voteCount)} total votes)`}
    >
      {/* Vote Count */}
      <div className={`
        font-bold transition-all duration-200
        ${isLoading ? 'text-lg opacity-50' : 'text-xl'}
        ${hasVoted 
          ? 'text-blue-600 group-hover:text-blue-700 group-hover:scale-105' 
          : 'text-blue-600 group-hover:text-blue-700 group-hover:scale-105'
        }
      `}>
        {isLoading ? (
          <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <span key={voteCount} className="animate-fade-in">
            {formatCount(voteCount)}
          </span>
        )}
      </div>
      
      {/* Label */}
      <div className={`
        text-gray-500 font-medium leading-tight text-xs transition-colors duration-200
        group-hover:text-blue-600
      `}>
        {hasVoted ? 'Voted' : 'eVotes'}
      </div>
      
      {/* Error display */}
      {error && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 animate-fade-in whitespace-nowrap shadow-sm z-10 max-w-xs text-center">
          {error}
        </div>
      )}
    </button>
  )
}
