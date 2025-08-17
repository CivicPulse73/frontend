import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface QuickSearchProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
}

export default function QuickSearch({ 
  placeholder = "Search...", 
  className = "",
  onSearch 
}: QuickSearchProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        // Navigate to search page with query
        navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  const handleInputClick = () => {
    // Navigate to search page when input is clicked (for better mobile experience)
    navigate('/search')
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClick={handleInputClick}
        placeholder={placeholder}
        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      />
    </form>
  )
}
