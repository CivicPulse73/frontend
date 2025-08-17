import React, { useState, useEffect, useRef } from 'react';
import { LocationData, AssigneeOption } from '../../types';
import { apiClient } from '../../services/api';
import { Search, ChevronDown, User, MapPin, Loader2, CheckCircle } from 'lucide-react';

interface AssigneeSelectorProps {
  locationData: LocationData | null;
  selectedAssignee: string | null;
  onAssigneeSelect: (assigneeId: string | null) => void;
  error?: string;
}

export const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({
  locationData,
  selectedAssignee,
  onAssigneeSelect,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [assigneeOptions, setAssigneeOptions] = useState<AssigneeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch assignee options when location changes or dropdown opens
  const fetchAssigneeOptions = async () => {
    if (!locationData?.latitude || !locationData?.longitude) {
      setAssigneeOptions([]);
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          assignee_options: Array<{
            value: string;
            label: string;
            title: {
              id: string;
              title_name: string;
              abbreviation: string;
              level_rank: number;
              description: string;
              title_type: string;
            };
            jurisdiction: {
              id: string;
              name: string;
              level_name: string;
              level_rank: number;
            };
          }>;
          location: { latitude: number; longitude: number };
          total: number;
        };
      }>(`/posts/representatives/by-location?latitude=${locationData.latitude}&longitude=${locationData.longitude}`);

      if (response.success && response.data) {
        const options: AssigneeOption[] = response.data.assignee_options.map(option => ({
          id: option.value,
          name: option.title.abbreviation ? `${option.title.abbreviation} - ${option.title.title_name}` : option.title.title_name,
          type: 'representative' as const,
          title: option.title.title_name,
          abbreviation: option.title.abbreviation,
          jurisdiction: option.jurisdiction.name,
          level_rank: option.jurisdiction.level_rank
        }));

        // Sort by level rank (lower number = higher priority)
        options.sort((a, b) => (a.level_rank || 999) - (b.level_rank || 999));
        setAssigneeOptions(options);
      } else {
        setAssigneeOptions([]);
        setFetchError('No assignees found for this location');
      }
    } catch (err: any) {
      console.error('Error fetching assignee options:', err);
      setFetchError(err.message || 'Failed to fetch assignee options');
      setAssigneeOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter options based on search query
  const filteredOptions = assigneeOptions.filter(option =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (option.abbreviation && option.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (option.jurisdiction && option.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get selected option details
  const selectedOption = assigneeOptions.find(option => option.id === selectedAssignee);

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
    if (assigneeOptions.length === 0 && locationData) {
      fetchAssigneeOptions();
    }
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't close if clicking within the dropdown
    if (containerRef.current && containerRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    // Add a small delay to allow for option clicks
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle option selection
  const handleOptionSelect = (option: AssigneeOption) => {
    onAssigneeSelect(option.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle clear selection
  const handleClear = () => {
    onAssigneeSelect(null);
    setSearchQuery('');
  };

  // Get display text for selected option
  const getDisplayText = () => {
    if (selectedOption) {
      return `${selectedOption.name} - ${selectedOption.jurisdiction}`;
    }
    return '';
  };

  // Render option item
  const renderOption = (option: AssigneeOption) => (
    <div
      key={option.id}
      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
      onClick={() => handleOptionSelect(option)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-gray-900 text-sm">
                {option.name}
              </span>
              {option.abbreviation && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {option.abbreviation}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 ml-10">
            <MapPin className="w-3 h-3" />
            <span>{option.jurisdiction}</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-right">
            <div className="text-xs text-gray-500">Select</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!locationData) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign to Representative *
        </label>
        {/* Location required message removed */}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Assign to Representative *
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : getDisplayText()}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={selectedOption ? getDisplayText() : "Search representatives by name, title, or district..."}
          className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
            error 
              ? 'border-red-500 bg-red-50 focus:ring-red-200' 
              : selectedOption 
                ? 'border-green-500 bg-green-50 focus:ring-green-200' 
                : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-200'
          } ${selectedOption && !isOpen ? 'cursor-pointer' : ''}`}
          readOnly={selectedOption && !isOpen}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          ) : selectedOption ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                title="Clear selection"
              >
                ×
              </button>
            </div>
          ) : (
            <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-600" />
              <p className="text-sm text-gray-600">Finding representatives in your area...</p>
            </div>
          ) : fetchError ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-red-600 mb-3">{fetchError}</p>
              <button
                type="button"
                onClick={fetchAssigneeOptions}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Try again
              </button>
            </div>
          ) : filteredOptions.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Search className="w-4 h-4" />
                    <span>
                      {searchQuery ? `${filteredOptions.length} results for "${searchQuery}"` : `${assigneeOptions.length} representatives available`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Clear search
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        ⎋ to close
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Close dropdown"
                    >
                      <ChevronDown className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredOptions.map(renderOption)}
              </div>
            </>
          ) : assigneeOptions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">No representatives found</p>
              <p className="text-xs text-gray-500">Try selecting a different location or check if the area has assigned representatives.</p>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-2">No results found for "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear search to see all options
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};