import { apiClient } from './api'
import { User } from '../types'

export interface UpdateUserRequest {
  username?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  cover_photo?: string
}

export const userService = {
  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>('/users/profile')
  },

  async updateProfile(userData: UpdateUserRequest): Promise<User> {
    return await apiClient.put<User>('/users/profile', userData)
  },

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'}/api/v1/users/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload avatar')
    }

    const result = await response.json()
    return result.data || result
  },

  async uploadCoverPhoto(file: File): Promise<{ cover_photo_url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'}/api/v1/users/cover-photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload cover photo')
    }

    const result = await response.json()
    return result.data || result
  }
}
