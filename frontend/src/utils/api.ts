import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'sonner'

import { ApiResponse, ApiError } from '@/types/api'
import { AuthState } from '@/types/auth'

class ApiClient {
  private client: AxiosInstance
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.client = axios.create({
      baseURL: '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Get auth state from localStorage
        const authState = this.getAuthState()

        if (authState.accessToken) {
          config.headers.Authorization = `Bearer ${authState.accessToken}`
        }

        if (authState.tenant?.identifier) {
          config.headers['X-Tenant-ID'] = authState.tenant.identifier
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const newToken = await this.refreshAccessToken()
            originalRequest.headers.Authorization = `Bearer ${newToken}`

            return this.client(originalRequest)
          } catch (refreshError) {
            // Refresh failed, logout user
            this.clearAuthState()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        // Handle other errors
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private getAuthState(): AuthState {
    try {
      const authData = localStorage.getItem('auth')
      if (authData) {
        return JSON.parse(authData)
      }
    } catch (error) {
      console.error('Error parsing auth state:', error)
    }

    return {
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
    }
  }

  private setAuthState(authState: Partial<AuthState>) {
    try {
      const currentAuthState = this.getAuthState()
      const newAuthState = { ...currentAuthState, ...authState }
      localStorage.setItem('auth', JSON.stringify(newAuthState))
    } catch (error) {
      console.error('Error setting auth state:', error)
    }
  }

  private clearAuthState() {
    localStorage.removeItem('auth')
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performTokenRefresh()

    try {
      const token = await this.refreshPromise
      return token
    } finally {
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const authState = this.getAuthState()

    if (!authState.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await this.client.post('/auth/refresh', {
      refreshToken: authState.refreshToken,
    })

    const { accessToken } = response.data
    this.setAuthState({ accessToken })

    return accessToken
  }

  private handleError(error: any) {
    const apiError: ApiError = {
      message: error.message || 'An unexpected error occurred',
      error: error.response?.data?.error || 'UNKNOWN_ERROR',
      statusCode: error.response?.status || 500,
      details: error.response?.data?.details,
    }

    // Show toast notification for user-friendly errors
    if (error.response?.status >= 400 && error.response?.status < 500) {
      toast.error(apiError.message)
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }

    return apiError
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config)
    return response.data
  }

  // File upload
  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }

  // Download
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient()

// Export convenience methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config),
  upload: <T = any>(url: string, file: File, onProgress?: (progress: number) => void) =>
    apiClient.upload<T>(url, file, onProgress),
  download: (url: string, filename?: string) => apiClient.download(url, filename),
}

export default api