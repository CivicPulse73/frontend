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

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const rolesData = await roleService.getRoles()
      setRoles(rolesData.sort((a, b) => (a.h_order || 0) - (b.h_order || 0)))
    } catch (error) {
      console.error('Error loading roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    try {
      const newRole = await roleService.createRole(formData)
      if (newRole) {
        setRoles([...roles, newRole].sort((a, b) => (a.h_order || 0) - (b.h_order || 0)))
        setShowCreateModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating role:', error)
      alert('Failed to create role')
    }
  }

  const handleUpdateRole = async () => {
    if (!editingRole) return
    
    try {
      const updatedRole = await roleService.updateRole(editingRole.id, formData)
      if (updatedRole) {
        setRoles(roles.map(role => 
          role.id === editingRole.id ? updatedRole : role
        ).sort((a, b) => (a.h_order || 0) - (b.h_order || 0)))
        setEditingRole(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return
    
    try {
      const success = await roleService.deleteRole(roleId)
      if (success) {
        setRoles(roles.filter(role => role.id !== roleId))
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      alert('Failed to delete role')
    }
  }

  const resetForm = () => {
    setFormData({
      role_name: '',
      abbreviation: '',
      h_order: 0,
      role_type: '',
      description: '',
      level: '',
      is_elected: false,
      term_length: undefined,
      status: 'active'
    })
  }

  const startEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      role_name: role.role_name,
      abbreviation: role.abbreviation || '',
      h_order: role.h_order || 0,
      role_type: role.role_type || '',
      description: role.description || '',
      level: role.level || '',
      is_elected: role.is_elected || false,
      term_length: role.term_length,
      status: role.status
    })
  }

  const cancelEdit = () => {
    setEditingRole(null)
    setShowCreateModal(false)
    resetForm()
  }

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Role</span>
        </button>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-4">
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
                <p className="text-gray-600 mb-2">{role.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Type: {role.role_type}</span>
                  <span>Level: {role.level}</span>
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
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingRole) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Level</option>
                    <option value="National">National</option>
                    <option value="State">State</option>
                    <option value="Local">Local</option>
                  </select>
                </div>
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
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_elected}
                    onChange={(e) => setFormData({ ...formData, is_elected: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
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
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingRole ? handleUpdateRole : handleCreateRole}
                className="btn-primary"
                disabled={!formData.role_name}
              >
                {editingRole ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
