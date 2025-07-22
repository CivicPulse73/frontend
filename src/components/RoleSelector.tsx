import { useState, useCallback, useMemo } from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'
import { useRoles } from '../hooks/useRoles'

interface RoleSelectorProps {
  selectedRoleId?: string
  onRoleSelect: (roleId: string | null) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  allowClear?: boolean
  filterByType?: string
  filterByLevel?: string
}

export default function RoleSelector({ 
  selectedRoleId, 
  onRoleSelect, 
  disabled = false,
  className = '',
  placeholder = 'Select a role',
  allowClear = true,
  filterByType,
  filterByLevel
}: RoleSelectorProps) {
  const { roles, loading, error, getRoleById } = useRoles()
  const [isOpen, setIsOpen] = useState(false)

  // Memoized filtered and sorted roles
  const filteredRoles = useMemo(() => {
    let filtered = roles.filter(role => role.status === 'active')
    
    if (filterByType) {
      filtered = filtered.filter(role => 
        role.role_type.toLowerCase() === filterByType.toLowerCase()
      )
    }
    
    if (filterByLevel) {
      filtered = filtered.filter(role => 
        role.level.toLowerCase() === filterByLevel.toLowerCase()
      )
    }
    
    return filtered.sort((a, b) => a.h_order - b.h_order)
  }, [roles, filterByType, filterByLevel])

  const selectedRole = useMemo(() => {
    return selectedRoleId ? getRoleById(selectedRoleId) : undefined
  }, [selectedRoleId, getRoleById])

  const handleRoleSelect = useCallback((roleId: string | null) => {
    onRoleSelect(roleId)
    setIsOpen(false)
  }, [onRoleSelect])

  const handleToggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev)
    }
  }, [disabled])

  // Loading state
  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
          <span className="text-gray-500">Loading roles...</span>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-between w-full px-3 py-2 border border-red-300 rounded-md bg-red-50">
          <span className="text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Failed to load roles
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleToggleDropdown}
        disabled={disabled}
        className={`flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-left truncate">
          {selectedRole ? (
            <span className="flex items-center space-x-2">
              {selectedRole.abbreviation && (
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                  {selectedRole.abbreviation}
                </span>
              )}
              <span>{selectedRole.role_name}</span>
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {allowClear && (
            <button
              type="button"
              onClick={() => handleRoleSelect(null)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <span className="text-gray-500">No role (Citizen)</span>
            </button>
          )}
          
          {filteredRoles.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-center">
              No roles available
            </div>
          ) : (
            filteredRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSelect(role.id)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  selectedRoleId === role.id ? 'bg-primary-50 text-primary-700' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  {role.abbreviation && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                      {role.abbreviation}
                    </span>
                  )}
                  <span className="font-medium">{role.role_name}</span>
                </div>
                {role.description && (
                  <p className="text-sm text-gray-500 mt-1 truncate">{role.description}</p>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
