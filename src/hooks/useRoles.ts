import { useState, useEffect, useCallback } from 'react'
import { Role } from '../types'
import { roleService } from '../services/roles'

interface UseRolesReturn {
  roles: Role[]
  loading: boolean
  error: string | null
  refreshRoles: () => Promise<void>
  getRoleById: (id: string) => Role | undefined
  getRoleByAbbreviation: (abbreviation: string) => Role | undefined
  getSortedRoles: (sortBy?: 'name' | 'order' | 'type') => Role[]
}

/**
 * Custom hook for managing role data with caching and error handling
 */
export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const rolesData = await roleService.getRoles()
      setRoles(rolesData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load roles'
      setError(errorMessage)
      console.error('Error loading roles:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const refreshRoles = useCallback(async () => {
    await loadRoles()
  }, [loadRoles])

  const getRoleById = useCallback((id: string): Role | undefined => {
    return roles.find(role => role.id === id)
  }, [roles])

  const getRoleByAbbreviation = useCallback((abbreviation: string): Role | undefined => {
    return roles.find(role => 
      role.abbreviation?.toLowerCase() === abbreviation.toLowerCase()
    )
  }, [roles])

  const getSortedRoles = useCallback((sortBy: 'name' | 'order' | 'type' = 'order'): Role[] => {
    const sortedRoles = [...roles]
    
    switch (sortBy) {
      case 'name':
        return sortedRoles.sort((a, b) => a.role_name.localeCompare(b.role_name))
      case 'type':
        return sortedRoles.sort((a, b) => {
          const typeComparison = a.role_type.localeCompare(b.role_type)
          return typeComparison !== 0 ? typeComparison : a.h_order - b.h_order
        })
      case 'order':
      default:
        return sortedRoles.sort((a, b) => a.h_order - b.h_order)
    }
  }, [roles])

  return {
    roles,
    loading,
    error,
    refreshRoles,
    getRoleById,
    getRoleByAbbreviation,
    getSortedRoles
  }
}
