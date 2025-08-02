# Simple Search Suggestions Frontend Implementation

This document explains how to use the simple search suggestions functionality in the CivicPulse frontend to avoid React object rendering errors.

## Problem Solved

Previously, the search suggestions returned complex objects with nested properties, which caused React rendering errors like "Objects are not valid as a React child". The new simple suggestions endpoint returns plain text arrays that are safe to render directly in React.

## Backend Endpoint

The backend provides a new endpoint that returns simple string arrays:

```
GET /api/v1/search/suggestions/simple?q={query}&limit={limit}
```

**Response Format:**
```json
{
  "query": "test",
  "suggestions": ["test search", "testuser", "testuser123"],
  "count": 3
}
```

## Frontend Implementation

### 1. Search Service

The search service now includes a `getSimpleSuggestions()` method:

```typescript
// services/search.ts
async getSimpleSuggestions(
  query: string = '',
  limit: number = 10
): Promise<SimpleSuggestionsResponse> {
  try {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    params.append('limit', limit.toString())

    const response = await apiClient.get(
      `${this.baseUrl}/suggestions/simple?${params.toString()}`
    )
    return response as SimpleSuggestionsResponse
  } catch (error) {
    console.error('Get simple suggestions failed:', error)
    throw error
  }
}
```

### 2. Custom Hook

Use the `useSimpleSuggestions` hook for debounced suggestion loading:

```typescript
// hooks/useSimpleSuggestions.ts
import { useSimpleSuggestions } from '../hooks/useSimpleSuggestions'

const {
  suggestions,      // string[] - Plain text suggestions
  isLoading,       // boolean - Loading state
  error,           // string | null - Error message
  query,           // string - Current query
  setQuery,        // (query: string) => void - Set query
  clearSuggestions // () => void - Clear suggestions
} = useSimpleSuggestions({
  debounceMs: 300,      // Debounce delay
  minQueryLength: 2,    // Minimum query length
  limit: 10             // Max suggestions
})
```

### 3. Simple Autocomplete Component

Use the pre-built `SimpleSearchAutocomplete` component:

```jsx
import { SimpleSearchAutocomplete } from '../components/SimpleSearchAutocomplete'

<SimpleSearchAutocomplete
  placeholder="Search..."
  onSearch={(query) => console.log('Search:', query)}
  onSuggestionSelect={(suggestion) => console.log('Selected:', suggestion)}
  maxSuggestions={8}
  debounceMs={300}
  minQueryLength={2}
  className="w-full"
/>
```

### 4. Updated SearchModal

The main SearchModal has been updated to use simple suggestions:

```typescript
// Updated SearchModal.tsx
import { useSimpleSuggestions } from '../hooks/useSimpleSuggestions'

// Use simple suggestions instead of complex suggestions
const {
  suggestions: simpleSuggestions,
  isLoading: suggestionsLoading,
  setQuery: setSuggestionsQuery
} = useSimpleSuggestions({
  debounceMs: 300,
  minQueryLength: 1,
  limit: 5
})

// Render suggestions safely
{simpleSuggestions.length > 0 && query.trim() && (
  <div className="mt-3">
    <div className="flex flex-wrap gap-2">
      {simpleSuggestions.slice(0, 5).map((suggestion: string, index: number) => (
        <button
          key={`suggestion-${index}`}
          onClick={() => handleSuggestionClick(suggestion)}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full"
        >
          {suggestion}
        </button>
      ))}
    </div>
  </div>
)}
```

## Key Benefits

1. **No React Rendering Errors**: Returns plain strings instead of complex objects
2. **Better Performance**: Lighter payload with only essential suggestion text
3. **Easier Integration**: Direct text rendering without property extraction
4. **Type Safety**: Clear TypeScript interfaces for suggestion responses
5. **Consistent UX**: Reliable autocomplete behavior without crashes

## Migration Guide

If you're updating existing search components:

1. Replace complex suggestions with simple suggestions
2. Update suggestion rendering to use strings directly
3. Remove object property access (e.g., `suggestion.text` → `suggestion`)
4. Update TypeScript types to expect string arrays

### Before (Complex Suggestions)
```tsx
// ❌ This can cause React rendering errors
{suggestions.map((suggestion, index) => (
  <button key={index} onClick={() => handleClick(suggestion.text)}>
    {suggestion.text}  {/* Could be undefined or complex object */}
  </button>
))}
```

### After (Simple Suggestions)
```tsx
// ✅ Safe direct rendering
{simpleSuggestions.map((suggestion: string, index: number) => (
  <button 
    key={`suggestion-${index}`} 
    onClick={() => handleClick(suggestion)}
  >
    {suggestion}  {/* Always a string */}
  </button>
))}
```

## Example Implementation

See `SearchPage.tsx` for a complete example of using the simple suggestions with full search functionality.

## Testing

Test the endpoint directly:
```bash
curl -X GET "http://localhost:8000/api/v1/search/suggestions/simple?q=test&limit=5"
```

Expected response:
```json
{
  "query": "test",
  "suggestions": ["test search", "testuser", "testuser123"],
  "count": 3
}
```

## Troubleshooting

1. **No suggestions appearing**: Check that `minQueryLength` is met and API is responding
2. **TypeScript errors**: Ensure you're importing the correct types from `services/search.ts`
3. **API errors**: Verify the backend endpoint is available and authentication is handled
4. **Performance issues**: Adjust `debounceMs` to reduce API calls
