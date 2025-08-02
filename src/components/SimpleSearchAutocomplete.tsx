/**
 * Simple Search Autocomplete Component
 * Uses simple suggestions endpoint to avoid React object rendering errors
 */

import React, { useState, useRef, useEffect } from 'react'
import { useSimpleSuggestions } from '../hooks/useSimpleSuggestions'

interface SimpleSearchAutocompleteProps {
  placeholder?: string
  onSearch: (query: string) => void
  onSuggestionSelect?: (suggestion: string) => void
  className?: string
  maxSuggestions?: number
  debounceMs?: number
  minQueryLength?: number
}

export const SimpleSearchAutocomplete: React.FC<SimpleSearchAutocompleteProps> = ({
  placeholder = "Search...",
  onSearch,
  onSuggestionSelect,
  className = "",
  maxSuggestions = 10,
  debounceMs = 300,
  minQueryLength = 2
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const {
    suggestions,
    isLoading,
    error,
    query,
    setQuery,
    clearSuggestions
  } = useSimpleSuggestions({
    debounceMs,
    minQueryLength,
    limit: maxSuggestions
  })

  // Show suggestions when we have them and input is focused
  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && query.length >= minQueryLength)
  }, [suggestions, query, minQueryLength])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
  }

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    onSuggestionSelect?.(suggestion)
    onSearch(suggestion)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        onSearch(query)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : -1
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > -1 ? prev - 1 : suggestions.length - 1
        )
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else {
          onSearch(query)
          setShowSuggestions(false)
        }
        break
      
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0 && query.length >= minQueryLength) {
      setShowSuggestions(true)
    }
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        
        {/* Search Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          ) : (
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                index === selectedIndex ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <span className="truncate block">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute z-50 w-full mt-1 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
