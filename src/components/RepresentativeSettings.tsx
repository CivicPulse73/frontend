import { useState, useEffect } from 'react'
import { 
  representativeService, 
  Representative, 
  Title, 
  Jurisdiction
} from '../services/representatives'
import { useUser } from '../contexts/UserContext'
import { useDebounce } from '../hooks/useDebounce'
import { Card, Button } from './UI'
import { 
  Check, 
  Users, 
  MapPin, 
  Crown, 
  AlertCircle, 
  Loader2, 
  X, 
  Search, 
  ChevronDown,
  ArrowLeft
} from 'lucide-react'

interface RepresentativeSettingsProps {
  onClose?: () => void
  embedded?: boolean
}

type LinkingStep = 'overview' | 'select-title' | 'select-jurisdiction' | 'select-representative'

export default function RepresentativeSettings({ onClose, embedded = false }: RepresentativeSettingsProps) {
  const { user, refreshUser } = useUser()
  
  // State management
  const [linkedRepresentative, setLinkedRepresentative] = useState<Representative | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Linking process state
  const [linkingStep, setLinkingStep] = useState<LinkingStep>('overview')
  const [availableTitles, setAvailableTitles] = useState<Title[]>([])
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null)
  const [jurisdictionQuery, setJurisdictionQuery] = useState('')
  const [jurisdictionSuggestions, setJurisdictionSuggestions] = useState<Jurisdiction[]>([])
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction | null>(null)
  const [availableRepresentatives, setAvailableRepresentatives] = useState<Representative[]>([])
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  
  // Debounce jurisdiction search
  const debouncedJurisdictionQuery = useDebounce(jurisdictionQuery, 300)

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (linkingStep === 'select-title') {
      loadAvailableTitles()
    }
  }, [linkingStep])

  useEffect(() => {
    if (selectedTitle && debouncedJurisdictionQuery.trim().length >= 2) {
      searchJurisdictions()
    } else {
      setJurisdictionSuggestions([])
    }
  }, [selectedTitle, debouncedJurisdictionQuery])

  useEffect(() => {
    if (selectedTitle && selectedJurisdiction) {
      loadRepresentativesBySelection()
    }
  }, [selectedTitle, selectedJurisdiction])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
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
    } catch (err) {
      console.error('Error loading available titles:', err)
      setError(err instanceof Error ? err.message : 'Failed to load available titles')
    } finally {
      setLoading(false)
    }
  }

  const searchJurisdictions = async () => {
    if (!selectedTitle) return
    
    try {
      setSuggestionLoading(true)
      const suggestions = await representativeService.getJurisdictionSuggestions(
        selectedTitle.id,
        debouncedJurisdictionQuery,
        10
      )
      setJurisdictionSuggestions(suggestions)
    } catch (err) {
      console.error('Error searching jurisdictions:', err)
      setJurisdictionSuggestions([])
    } finally {
      setSuggestionLoading(false)
    }
  }

  const loadRepresentativesBySelection = async () => {
    if (!selectedTitle || !selectedJurisdiction) return
    
    try {
      setLoading(true)
      setError(null)
      
      const representatives = await representativeService.getRepresentativesBySelection(
        selectedTitle.id,
        selectedJurisdiction.id
      )
      setAvailableRepresentatives(representatives)
      setLinkingStep('select-representative')
    } catch (err) {
      console.error('Error loading representatives:', err)
      setError(err instanceof Error ? err.message : 'Failed to load representatives')
    } finally {
      setLoading(false)
    }
  }

  const handleTitleSelect = (title: Title) => {
    setSelectedTitle(title)
    setSelectedJurisdiction(null)
    setJurisdictionQuery('')
    setJurisdictionSuggestions([])
    setAvailableRepresentatives([])
    setLinkingStep('select-jurisdiction')
  }

  const handleJurisdictionSelect = (jurisdiction: Jurisdiction) => {
    setSelectedJurisdiction(jurisdiction)
    setJurisdictionQuery(jurisdiction.name)
    setJurisdictionSuggestions([])
  }

  const handleLinkRepresentative = async (representative: Representative) => {
    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      if (linkedRepresentative) {
        await representativeService.updateRepresentativeLink(representative.id)
        setSuccess(`Successfully updated representative link to ${representativeService.formatRepresentativeName(representative)}`)
      } else {
        await representativeService.linkRepresentative(representative.id)
        setSuccess(`Successfully linked to ${representativeService.formatRepresentativeName(representative)}`)
      }

      await refreshUser()
      setLinkedRepresentative(representative)
      resetLinkingProcess()
      
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
      
      await refreshUser()
      setLinkedRepresentative(null)
      
    } catch (err) {
      console.error('Error unlinking representative:', err)
      setError(err instanceof Error ? err.message : 'Failed to unlink representative')
    } finally {
      setActionLoading(false)
    }
  }

  const resetLinkingProcess = () => {
    setLinkingStep('overview')
    setSelectedTitle(null)
    setSelectedJurisdiction(null)
    setJurisdictionQuery('')
    setJurisdictionSuggestions([])
    setAvailableRepresentatives([])
    setAvailableTitles([])
  }

  const goBack = () => {
    switch (linkingStep) {
      case 'select-title':
        resetLinkingProcess()
        break
      case 'select-jurisdiction':
        setLinkingStep('select-title')
        setSelectedTitle(null)
        setJurisdictionQuery('')
        setJurisdictionSuggestions([])
        break
      case 'select-representative':
        setLinkingStep('select-jurisdiction')
        setSelectedJurisdiction(null)
        setAvailableRepresentatives([])
        break
      default:
        resetLinkingProcess()
    }
  }

  if (loading && linkingStep === 'overview') {
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
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {linkingStep !== 'overview' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {linkingStep === 'overview' && 'Representative Account Settings'}
              {linkingStep === 'select-title' && 'Select Title'}
              {linkingStep === 'select-jurisdiction' && 'Select Jurisdiction'}
              {linkingStep === 'select-representative' && 'Select Representative'}
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
      {linkingStep === 'overview' && (
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
                      onClick={() => setLinkingStep('select-title')}
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
                onClick={() => setLinkingStep('select-title')}
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
      {linkingStep === 'select-title' && (
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a Title</h3>
            <p className="text-gray-600">Select the title/position you want to link your account to.</p>
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
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {title.abbreviation ? `${title.abbreviation} - ${title.title_name}` : title.title_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {title.available_count} position{title.available_count !== 1 ? 's' : ''} available
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Titles Available</h3>
              <p className="text-gray-600">No representative titles are currently available for linking.</p>
            </div>
          )}
        </Card>
      )}

      {/* Jurisdiction Selection Step */}
      {linkingStep === 'select-jurisdiction' && selectedTitle && (
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Jurisdiction</h3>
            <p className="text-gray-600">
              Selected title: <span className="font-medium">{selectedTitle.title_name}</span>
            </p>
            <p className="text-gray-600 mt-1">
              Type the name of the jurisdiction where you want to serve.
            </p>
          </div>

          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Start typing jurisdiction name..."
                value={jurisdictionQuery}
                onChange={(e) => setJurisdictionQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
              {suggestionLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>

            {/* Jurisdiction Suggestions */}
            {jurisdictionSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {jurisdictionSuggestions.map((jurisdiction) => (
                  <div
                    key={jurisdiction.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleJurisdictionSelect(jurisdiction)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{jurisdiction.name}</h4>
                        <p className="text-sm text-gray-600">
                          {representativeService.getJurisdictionLevelName(jurisdiction.level)} • {' '}
                          {jurisdiction.available_count} position{jurisdiction.available_count !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {jurisdictionQuery.length >= 2 && jurisdictionSuggestions.length === 0 && !suggestionLoading && (
            <div className="text-center py-8 mt-4">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Jurisdictions Found</h3>
              <p className="text-gray-600">
                No jurisdictions found matching "{jurisdictionQuery}" for {selectedTitle.title_name}.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Representative Selection Step */}
      {linkingStep === 'select-representative' && selectedTitle && selectedJurisdiction && (
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Representative Position</h3>
            <p className="text-gray-600">
              Title: <span className="font-medium">{selectedTitle.title_name}</span> • {' '}
              Jurisdiction: <span className="font-medium">{selectedJurisdiction.name}</span>
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <span className="ml-2 text-gray-600">Loading representatives...</span>
            </div>
          ) : availableRepresentatives.length > 0 ? (
            <div className="space-y-3">
              {availableRepresentatives.map((representative) => (
                <div
                  key={representative.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {representativeService.formatRepresentativeName(representative)}
                      </h4>
                      <p className="text-sm text-gray-600 flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{representativeService.getJurisdictionLevelName(representative.jurisdiction_level)}</span>
                      </p>
                      {representative.description && (
                        <p className="text-sm text-gray-500 mt-2">{representative.description}</p>
                      )}
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
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Representatives Available</h3>
              <p className="text-gray-600">
                No representative positions are available for {selectedTitle.title_name} in {selectedJurisdiction.name}.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}