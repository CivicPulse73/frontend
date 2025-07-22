import { apiClient, ApiResponse } from './api'
import { Role } from '../types'

export interface CreateRoleData {
  role_name: string
  abbreviation?: string
  h_order?: number
  role_type?: string
  description?: string
  level?: string
  is_elected?: boolean
  term_length?: number
  status?: string
}

export interface UpdateRoleData {
  role_name?: string
  abbreviation?: string
  h_order?: number
  role_type?: string
  description?: string
  level?: string
  is_elected?: boolean
  term_length?: number
  status?: string
}

export const roleService = {
  // Get all roles
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<ApiResponse<Role[]>>('/roles')
    return response.data || []
  },

  // Get role by ID
  async getRole(roleId: string): Promise<Role | null> {
    try {
      const response = await apiClient.get<ApiResponse<Role>>(`/roles/${roleId}`)
      return response.data || null
    } catch (error) {
      console.error('Error fetching role:', error)
      return null
    }
  },

  // Create new role (Admin only)
  async createRole(roleData: CreateRoleData): Promise<Role | null> {
    try {
      const response = await apiClient.post<ApiResponse<Role>>('/roles', roleData)
      return response.data || null
    } catch (error) {
      console.error('Error creating role:', error)
      throw error
    }
  },

  // Update role (Admin only)
  async updateRole(roleId: string, roleData: UpdateRoleData): Promise<Role | null> {
    try {
      const response = await apiClient.put<ApiResponse<Role>>(`/roles/${roleId}`, roleData)
      return response.data || null
    } catch (error) {
      console.error('Error updating role:', error)
      throw error
    }
  },

  // Delete role (Admin only)
  async deleteRole(roleId: string): Promise<boolean> {
    try {
      await apiClient.delete<ApiResponse>(`/roles/${roleId}`)
      return true
    } catch (error) {
      console.error('Error deleting role:', error)
      return false
    }
  },

  // Assign role to user (Admin only)
  async assignUserRole(userId: string, roleId: string): Promise<boolean> {
    try {
      await apiClient.put<ApiResponse>(`/users/${userId}/role`, { role_id: roleId })
      return true
    } catch (error) {
      console.error('Error assigning role to user:', error)
      return false
    }
  }
}
