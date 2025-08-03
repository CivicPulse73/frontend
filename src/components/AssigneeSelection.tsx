import React, { useState, useEffect } from 'react'
import { Loader2, User, MapPin, Building, ChevronDown, AlertTriangle, UserCheck, UserX, X, AlertCircle, Check, Users } from 'lucide-react'
import { postsService } from '../services/posts'

interface TitleInfo {
  id: string
  title_name: string
  abbreviation?: string
  level_rank?: number
  description?: string
  title_type?: string
  level?: string
  is_elected?: boolean
  term_length?: number
  status?: string
  created_at?: string
  updated_at?: string
}

interface JurisdictionInfo {
  id: string
  name: string
  level_name: string
  level_rank: number
  parent_jurisdiction_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface AssigneeOption {
  value: string
  label: string
  title: TitleInfo
  jurisdiction: JurisdictionInfo
}

interface AssigneeSelectionProps {
  postId: string
  latitude?: number | string | null
  longitude?: number | string | null
  currentAssignee?: string | null
  onAssign: (assigneeId: string | null) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  showHeader?: boolean // New prop to control header visibility
}

export default function AssigneeSelection({
  postId,
  latitude,
  longitude,
  currentAssignee,
  onAssign,
  onCancel,
  isLoading = false,
  showHeader = true // Default to true for backward compatibility
}: AssigneeSelectionProps) {
  const [representatives, setRepresentatives] = useState<AssigneeOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(currentAssignee || null)

  // Convert string coordinates to numbers
  const numLatitude = typeof latitude === 'string' ? parseFloat(latitude) : latitude
  const numLongitude = typeof longitude === 'string' ? parseFloat(longitude) : longitude

  console.log('AssigneeSelection received:', { postId, latitude, longitude, currentAssignee })

  useEffect(() => {
    const fetchRepresentatives = async () => {
      // Only fetch if we have valid coordinates
      if (!numLatitude || !numLongitude || isNaN(numLatitude) || isNaN(numLongitude)) {
        console.log('AssigneeSelection: Invalid coordinates, skipping fetch', { numLatitude, numLongitude })
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('AssigneeSelection: Fetching representatives for:', { numLatitude, numLongitude })
        const response = await postsService.getRepresentativesByLocation(numLatitude, numLongitude)
        
        console.log('AssigneeSelection: Found representatives:', response.data?.assignee_options?.length || 0)
        
        if (response.success && response.data?.assignee_options) {
          setRepresentatives(response.data.assignee_options)
        } else {
          setError('No representatives found for this location')
        }
      } catch (err) {
        console.error('AssigneeSelection: Error fetching representatives:', err)
        setError('Failed to load representatives')
      } finally {
        setLoading(false)
      }
    }

    fetchRepresentatives()
  }, [numLatitude, numLongitude])

  const handleAssign = async (assigneeId: string | null) => {
    try {
      await onAssign(assigneeId)
      setSelectedAssignee(assigneeId)
    } catch (error) {
      console.error('Error assigning representative:', error)
      setError('Failed to assign representative')
    }
  }

  return (
    <div className="space-y-4">
      {/* Conditional Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Assign Representative</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Location Info */}
      {numLatitude && numLongitude && !isNaN(numLatitude) && !isNaN(numLongitude) && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <MapPin className="w-4 h-4" />
          <span>
            Location: {numLatitude.toFixed(4)}, {numLongitude.toFixed(4)}
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Representatives List */}
      {!loading && !error && representatives.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Found {representatives.length} representative{representatives.length === 1 ? '' : 's'} for this location:
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {representatives.map((rep) => (
              <div
                key={rep.value}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedAssignee === rep.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedAssignee(rep.value)}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{rep.label}</div>
                  <div className="text-sm text-gray-600">
                    {rep.title.title_name} • {rep.jurisdiction.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Level: {rep.jurisdiction.level_name}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedAssignee === rep.value && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Representatives Found */}
      {!loading && !error && representatives.length === 0 && numLatitude && numLongitude && (
        <div className="text-center p-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No representatives found for this location.</p>
          <p className="text-sm">Try a different location or contact support.</p>
        </div>
      )}

      {/* Invalid Coordinates */}
      {(!numLatitude || !numLongitude || isNaN(numLatitude) || isNaN(numLongitude)) && (
        <div className="text-center p-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Location coordinates not available.</p>
          <p className="text-sm">Cannot fetch representatives without valid coordinates.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        
        {selectedAssignee && (
          <button
            onClick={() => handleAssign(selectedAssignee)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Assigning...' : 'Assign Representative'}
          </button>
        )}
        
        {currentAssignee && (
          <button
            onClick={() => handleAssign(null)}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Removing...' : 'Remove Assignment'}
          </button>
        )}
      </div>
    </div>
  )
}