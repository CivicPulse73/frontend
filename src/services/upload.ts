import { apiClient, ApiResponse } from './api'

export interface UploadResponse {
  success: boolean
  message: string
  data: {
    file_url: string
    filename: string
    folder: string
    size?: number
    content_type?: string
  }
}

export interface MultipleUploadResponse {
  success: boolean
  message: string
  data: {
    uploaded_files: Array<{
      filename: string
      file_url: string
      size?: number
      content_type?: string
    }>
    failed_files: Array<{
      filename: string
      error: string
    }>
    folder: string
    total_count: number
    success_count: number
    failure_count: number
  }
}

export interface UploadStatusResponse {
  success: boolean
  data: {
    upload_service_available: boolean
    max_image_size_mb: number
    max_video_size_mb: number
    allowed_image_types: string[]
    allowed_video_types: string[]
    message: string
  }
}

export const uploadService = {
  /**
   * Upload a single file
   */
  async uploadSingleFile(
    file: File, 
    folder: string = 'general', 
    makePublic: boolean = false
  ): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const queryParams = new URLSearchParams({
      folder,
      make_public: makePublic.toString()
    })

    const response = await fetch(`${window.location.origin}/api/v1/upload/single?${queryParams}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('civic_access_token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to upload file')
    }

    return await response.json()
  },

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[], 
    folder: string = 'general', 
    makePublic: boolean = false
  ): Promise<MultipleUploadResponse> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const queryParams = new URLSearchParams({
      folder,
      make_public: makePublic.toString()
    })

    const response = await fetch(`${window.location.origin}/api/v1/upload/multiple?${queryParams}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('civic_access_token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to upload files')
    }

    return await response.json()
  },

  /**
   * Delete a file
   */
  async deleteFile(fileUrl: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ApiResponse<{ deleted_url: string }>>(
      `/upload/delete?file_url=${encodeURIComponent(fileUrl)}`
    )
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete file')
    }
    
    return {
      success: true,
      message: 'File deleted successfully'
    }
  },

  /**
   * Get upload service status
   */
  async getUploadStatus(): Promise<UploadStatusResponse> {
    const response = await apiClient.get<ApiResponse<UploadStatusResponse['data']>>('/upload/status')
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to get upload status')
    }
    
    return {
      success: true,
      data: response.data!
    }
  },

  /**
   * Validate file before upload
   */
  validateFile(file: File, allowedTypes?: string[], maxSizeMB?: number): { valid: boolean; error?: string } {
    // Default validation
    const defaultImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const defaultVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
    const defaultAllowedTypes = [...defaultImageTypes, ...defaultVideoTypes]
    
    const allowedFileTypes = allowedTypes || defaultAllowedTypes
    const defaultMaxSize = file.type.startsWith('image/') ? 10 : 100 // 10MB for images, 100MB for videos
    const maxFileSize = (maxSizeMB || defaultMaxSize) * 1024 * 1024 // Convert to bytes

    // Check file type
    if (!allowedFileTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type '${file.type}' not allowed. Allowed types: ${allowedFileTypes.join(', ')}`
      }
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSizeMB || defaultMaxSize}MB`
      }
    }

    return { valid: true }
  },

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * Generate a preview URL for uploaded images
   */
  generatePreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      reader.readAsDataURL(file)
    })
  }
}
