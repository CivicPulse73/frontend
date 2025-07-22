import { useState, useCallback, useMemo } from 'react'
import { Plus, Edit3, Trash2, Users, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { Role } from '../types'
import { roleService } from '../services/roles'
import { useRoles } from '../hooks/useRoles'

interface RoleManagementProps {
  onClose?: () => void
}

interface FormData {
  role_name: string
  abbreviation: string
  h_order: number
  role_type: string
  description: string
  level: string
  is_elected: boolean
  term_length?: number
  status: string
}

const initialFormData: FormData = {
  role_name: '',
  abbreviation: '',
  h_order: 0,
  role_type: '',
  description: '',
  level: '',
  is_elected: false,
  term_length: undefined,
  status: 'active'
}

export default function RoleManagement({ onClose }: RoleManagementProps) {
  const { roles, loading, error, refreshRoles } = useRoles()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Memoized sorted roles
  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => a.h_order - b.h_order)
  }, [roles])

  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 5000)
  }, [])

  const validateForm = useCallback((): string[] => {
    const errors: string[] = []
    
    if (!formData.role_name.trim()) {
      errors.push('Role name is required')
    }
    
    if (formData.role_name.length > 100) {
      errors.push('Role name must be 100 characters or less')
    }
    
    if (formData.abbreviation && formData.abbreviation.length > 20) {
      errors.push('Abbreviation must be 20 characters or less')
    }
    
    if (formData.h_order < 0) {
      errors.push('Order must be a non-negative number')
    }
    
    if (formData.is_elected && formData.term_length && formData.term_length <= 0) {
      errors.push('Term length must be positive for elected positions')
    }
    
    return errors
  }, [formData])

  const handleCreateRole = useCallback(async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      showFeedback('error', errors.join(', '))
      return
    }

    try {
      setSubmitting(true)
      const newRole = await roleService.createRole(formData)
      if (newRole) {
        await refreshRoles()
        setShowCreateModal(false)
        setFormData(initialFormData)
        showFeedback('success', 'Role created successfully')
      }
    } catch (error) {
      console.error('Error creating role:', error)
      showFeedback('error', error instanceof Error ? error.message : 'Failed to create role')
    } finally {
      setSubmitting(false)
    }
  }, [formData, validateForm, showFeedback, refreshRoles])

  const handleUpdateRole = useCallback(async () => {
    if (!editingRole) return

    const errors = validateForm()
    if (errors.length > 0) {
      showFeedback('error', errors.join(', '))
      return
    }
    
    try {
      setSubmitting(true)
      const updatedRole = await roleService.updateRole(editingRole.id, formData)
      if (updatedRole) {
        await refreshRoles()
        setEditingRole(null)
        setFormData(initialFormData)
        showFeedback('success', 'Role updated successfully')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      showFeedback('error', error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setSubmitting(false)
    }
  }, [editingRole, formData, validateForm, showFeedback, refreshRoles])

  const handleDeleteRole = useCallback(async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      setSubmitting(true)
      const success = await roleService.deleteRole(roleId)
      if (success) {
        await refreshRoles()
        showFeedback('success', 'Role deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      showFeedback('error', error instanceof Error ? error.message : 'Failed to delete role')
    } finally {
      setSubmitting(false)
    }
  }, [showFeedback, refreshRoles])

  const startEdit = useCallback((role: Role) => {
    setEditingRole(role)
    setFormData({
      role_name: role.role_name || '',
      abbreviation: role.abbreviation || '',
      h_order: role.h_order || 0,
      role_type: role.role_type || '',
      description: role.description || '',
      level: role.level || '',
      is_elected: role.is_elected || false,
      term_length: role.term_length,
      status: role.status || 'active'
    })
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingRole(null)
    setShowCreateModal(false)
    setFormData(initialFormData)
    setFeedback(null)
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roles...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Roles</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshRoles}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={submitting}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Role</span>
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          feedback.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Roles List */}
      <div className="space-y-4">
        {sortedRoles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Roles Found</h3>
            <p className="text-gray-600 mb-4">Create your first role to get started.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Role
            </button>
          </div>
        ) : (
          sortedRoles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{role.role_name}</h3>
                    {role.abbreviation && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {role.abbreviation}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">Order: {role.h_order}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{role.description || 'No description'}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Type: {role.role_type || 'Not specified'}</span>
                    <span>Level: {role.level || 'Not specified'}</span>
                    {role.is_elected && (
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>Elected</span>
                        {role.term_length && <span>({role.term_length} years)</span>}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(role)}
                    disabled={submitting}
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors disabled:opacity-50"
                    title="Edit role"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id, role.role_name)}
                    disabled={submitting}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    title="Delete role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingRole) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.role_name}
                  onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., President, Mayor"
                  disabled={submitting}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abbreviation
                </label>
                <input
                  type="text"
                  value={formData.abbreviation}
                  onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., PREZ, MAYOR"
                  disabled={submitting}
                  maxLength={20}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.h_order}
                    onChange={(e) => setFormData({ ...formData, h_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.role_type}
                    onChange={(e) => setFormData({ ...formData, role_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    disabled={submitting}
                  >
                    <option value="">Select Type</option>
                    <option value="Executive">Executive</option>
                    <option value="Legislative">Legislative</option>
                    <option value="Judicial">Judicial</option>
                    <option value="Administrative">Administrative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  disabled={submitting}
                >
                  <option value="">Select Level</option>
                  <option value="National">National</option>
                  <option value="State">State</option>
                  <option value="Local">Local</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Brief description of the role"
                  disabled={submitting}
                  maxLength={500}
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_elected}
                    onChange={(e) => setFormData({ ...formData, is_elected: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Elected Position</span>
                </label>

                {formData.is_elected && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Term Length (years)
                    </label>
                    <input
                      type="number"
                      value={formData.term_length || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        term_length: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      min="1"
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelEdit}
                disabled={submitting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={editingRole ? handleUpdateRole : handleCreateRole}
                disabled={!formData.role_name || submitting}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Saving...' : (editingRole ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
