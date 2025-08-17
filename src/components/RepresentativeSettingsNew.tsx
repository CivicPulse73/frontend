import { useState, useEffect } from 'react'
import { representativeService, Representative, Title, Jurisdiction } from '../services/representatives'
import { useUser } from '../contexts/UserContext'
import { Card, Button } from './UI'
import { Check, Users, MapPin, Crown, AlertCircle, Loader2, X, Search, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { useDebouncedJurisdictionSearch } from '../hooks/useDebounce'

interface RepresentativeSettingsProps {
  onClose?: () => void
  embedded?: boolean // Whether this is embedded in another component or standalone
}

type SelectionStep = 'overview' | 'select-title' | 'select-jurisdiction' | 'confirm-selection'

interface Selection {
  title?: Title
  jurisdiction?: Jurisdiction
  representatives: Representative[]
}

export default function RepresentativeSettings({ onClose, embedded = false }: RepresentativeSettingsProps) {
  const { user, refreshUser } = useUser()
  const [linkedRepresentative, setLinkedRepresentative] = useState<Representative | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Two-step selection state
  const [currentStep, setCurrentStep] = useState<SelectionStep>('overview')
  const [availableTitles, setAvailableTitles] = useState<Title[]>([])
  const [jurisdictionSuggestions, setJurisdictionSuggestions] = useState<Jurisdiction[]>([])
  const [jurisdictionQuery, setJurisdictionQuery] = useState('')
  const [selection, setSelection] = useState<Selection>({ representatives: [] })
  
  // Debounced jurisdiction search
  const { debouncedQuery, isSearching, shouldSearch } = useDebouncedJurisdictionSearch(
    selection.title?.id || null,
    jurisdictionQuery,
    500
  )

  useEffect(() => {
    loadSettings()
  }, [])

  // Load jurisdiction suggestions when title is selected and user is typing
  useEffect(() => {
    if (shouldSearch) {
      loadJurisdictionSuggestions()
    } else {
      setJurisdictionSuggestions([])
    }
  }, [shouldSearch, debouncedQuery, selection.title?.id])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get user's linked representative if any
      if (user?.linked_representative) {
        setLinkedRepresentative(user.linked_representative as Representative)
      }
    } catch (err) {
      console.error('Error loading representative settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableTitles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const titles = await representativeService.getAvailableTitles()
      setAvailableTitles(titles)
      setCurrentStep('select-title')
    } catch (err) {
      console.error('Error loading available titles:', err)
      setError(err instanceof Error ? err.message : 'Failed to load available titles')
    } finally {
      setLoading(false)
    }
  }

  const loadJurisdictionSuggestions = async () => {
    if (!selection.title?.id || !debouncedQuery) return

    try {
      const suggestions = await representativeService.getJurisdictionSuggestions(
        selection.title.id,
        debouncedQuery,
        10
      )
      setJurisdictionSuggestions(suggestions)
    } catch (err) {
      console.error('Error loading jurisdiction suggestions:', err)
      setJurisdictionSuggestions([])
    }
  }

  const loadRepresentativesBySelection = async () => {
    if (!selection.title?.id || !selection.jurisdiction?.id) return

    try {
      setLoading(true)
      setError(null)

      const representatives = await representativeService.getRepresentativesBySelection(
        selection.title.id,
        selection.jurisdiction.id
      )
      setSelection(prev => ({ ...prev, representatives }))
      setCurrentStep('confirm-selection')
    } catch (err) {
      console.error('Error loading representatives by selection:', err)
      setError(err instanceof Error ? err.message : 'Failed to load representatives')
    } finally {
      setLoading(false)
    }
  }

  const handleTitleSelect = (title: Title) => {
    setSelection(prev => ({ ...prev, title, jurisdiction: undefined, representatives: [] }))
    setJurisdictionQuery('')
    setCurrentStep('select-jurisdiction')
  }

  const handleJurisdictionSelect = (jurisdiction: Jurisdiction) => {
    setSelection(prev => ({ ...prev, jurisdiction }))
    setJurisdictionQuery(jurisdiction.name)
    setJurisdictionSuggestions([])
    loadRepresentativesBySelection()
  }

  const handleLinkRepresentative = async (representative: Representative) => {
    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      if (linkedRepresentative) {
        // Update existing link
        await representativeService.updateRepresentativeLink(representative.id)
        setSuccess(`Successfully updated representative link to ${representativeService.formatRepresentativeName(representative)}`)
      } else {
        // Create new link
        await representativeService.linkRepresentative(representative.id)
        setSuccess(`Successfully linked to ${representativeService.formatRepresentativeName(representative)}`)
      }

      // Refresh user data and reset to overview
      await refreshUser()
      setLinkedRepresentative(representative)
      setCurrentStep('overview')
      setSelection({ representatives: [] })
      
    } catch (err) {
      console.error('Error linking representative:', err)
      setError(err instanceof Error ? err.message : 'Failed to link representative')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnlinkRepresentative = async () => {
    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      await representativeService.unlinkRepresentative()
      setSuccess('Successfully unlinked from representative account')
      
      // Refresh user data
      await refreshUser()
      setLinkedRepresentative(null)
      
    } catch (err) {
      console.error('Error unlinking representative:', err)
      setError(err instanceof Error ? err.message : 'Failed to unlink representative')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'select-title':
        setCurrentStep('overview')
        break
      case 'select-jurisdiction':
        setCurrentStep('select-title')
        setSelection(prev => ({ ...prev, jurisdiction: undefined, representatives: [] }))
        setJurisdictionQuery('')
        break
      case 'confirm-selection':
        setCurrentStep('select-jurisdiction')
        setSelection(prev => ({ ...prev, representatives: [] }))
        break
      default:
        setCurrentStep('overview')
    }
  }

  if (loading && currentStep === 'overview') {
    return (
      <Card className={embedded ? "p-4" : "p-6"}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          <span className="ml-2 text-gray-600">Loading representative settings...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className={embedded ? "space-y-4" : "max-w-4xl mx-auto p-6 space-y-6"}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {currentStep !== 'overview' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {currentStep === 'overview' && 'Representative Account Settings'}
              {currentStep === 'select-title' && 'Select Title'}
              {currentStep === 'select-jurisdiction' && 'Select Jurisdiction'}
              {currentStep === 'confirm-selection' && 'Confirm Selection'}
            </h1>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Success</h3>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Overview Step */}
      {currentStep === 'overview' && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="w-6 h-6 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900">Current Representative Account</h2>
          </div>

          {linkedRepresentative ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900 mb-1">
                      {representativeService.formatRepresentativeName(linkedRepresentative)}
                    </h3>
                    <p className="text-sm text-blue-700 flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{representativeService.getJurisdictionLevelName(linkedRepresentative.jurisdiction_level)}</span>
                    </p>
                    {linkedRepresentative.description && (
                      <p className="text-sm text-blue-600 mt-2">
                        {linkedRepresentative.description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadAvailableTitles}
                      disabled={actionLoading}
                    >
                      Change
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnlinkRepresentative}
                      disabled={actionLoading}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unlink'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Representative Account Linked</h3>
              <p className="text-gray-600 mb-4">
                Link your account to a representative position to access representative features.
              </p>
              <Button
                onClick={loadAvailableTitles}
                disabled={actionLoading}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Link Representative Account
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Title Selection Step */}
      {currentStep === 'select-title' && (
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Title</h3>
            <p className="text-gray-600">Choose the representative title you want to link to your account.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <span className="ml-2 text-gray-600">Loading available titles...</span>
            </div>
          ) : availableTitles.length > 0 ? (
            <div className="grid gap-3">
              {availableTitles.map((title) => (
                <div
                  key={title.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer"
                  onClick={() => handleTitleSelect(title)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {title.title_name}
                        {title.abbreviation && (
                          <span className="text-gray-500 ml-2">({title.abbreviation})</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {title.available_count} available position{title.available_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-gray-400">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Titles Available</h3>
              <p className="text-gray-600">
                No representative titles are currently available for linking.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Jurisdiction Selection Step */}
      {currentStep === 'select-jurisdiction' && selection.title && (
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Jurisdiction</h3>
            <p className="text-gray-600">
              Search for the jurisdiction where you want to serve as <strong>{selection.title.title_name}</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Type jurisdiction name (e.g., New York, California, Mumbai)..."
                value={jurisdictionQuery}
                onChange={(e) => setJurisdictionQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            {/* Jurisdiction Suggestions */}
            {jurisdictionSuggestions.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                {jurisdictionSuggestions.map((jurisdiction) => (
                  <div
                    key={jurisdiction.id}
                    className="border-b border-gray-100 last:border-b-0 p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleJurisdictionSelect(jurisdiction)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {jurisdiction.name}
                          {jurisdiction.abbreviation && (
                            <span className="text-gray-500 ml-2">({jurisdiction.abbreviation})</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {jurisdiction.level} • {jurisdiction.available_count} available position{jurisdiction.available_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {jurisdictionQuery.length > 0 && !isSearching && jurisdictionSuggestions.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p>No jurisdictions found matching "{jurisdictionQuery}"</p>
                <p className="text-sm mt-1">Try a different search term or check your spelling.</p>
              </div>
            )}

            {jurisdictionQuery.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p>Start typing to search for jurisdictions</p>
                <p className="text-sm mt-1">We'll show suggestions as you type.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Confirm Selection Step */}
      {currentStep === 'confirm-selection' && selection.title && selection.jurisdiction && (
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Your Selection</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-800">
                <Crown className="w-5 h-5" />
                <span className="font-medium">{selection.title.title_name}</span>
                <span className="text-blue-600">in</span>
                <span className="font-medium">{selection.jurisdiction.name}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <span className="ml-2 text-gray-600">Loading available positions...</span>
            </div>
          ) : selection.representatives.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Choose from the available {selection.title.title_name} positions in {selection.jurisdiction.name}:
              </p>
              <div className="grid gap-3">
                {selection.representatives.map((representative) => (
                  <div
                    key={representative.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {representativeService.formatRepresentativeName(representative)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {representative.description || 'No description available'}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleLinkRepresentative(representative)}
                        disabled={actionLoading}
                        size="sm"
                        className="ml-4"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Link Account'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Positions Available</h3>
              <p className="text-gray-600 mb-4">
                No {selection.title.title_name} positions are currently available in {selection.jurisdiction.name}.
              </p>
              <Button
                variant="outline"
                onClick={() => setCurrentStep('select-jurisdiction')}
              >
                Try Different Jurisdiction
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
