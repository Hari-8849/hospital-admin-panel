import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

import { AuthState, AuthContextType, LoginCredentials, RegisterData, User, Tenant } from '@/types/auth'
import { api } from '@/utils/api'

// Auth action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tenant: Tenant; accessToken: string; refreshToken: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TENANT'; payload: Tenant }
  | { type: 'REFRESH_TOKEN'; payload: string }
  | { type: 'CLEAR_AUTH' }

// Initial state
const initialState: AuthState = {
  user: null,
  tenant: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
}

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      }

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tenant: action.payload.tenant,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isLoading: false,
        isAuthenticated: true,
      }

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        tenant: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      }

    case 'LOGOUT':
    case 'CLEAR_AUTH':
      return {
        ...state,
        user: null,
        tenant: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      }

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      }

    case 'SET_TENANT':
      return {
        ...state,
        tenant: action.payload,
      }

    case 'REFRESH_TOKEN':
      return {
        ...state,
        accessToken: action.payload,
      }

    default:
      return state
  }
}

// Storage helpers
const storage = {
  getAuthState: (): AuthState | null => {
    try {
      const authData = localStorage.getItem('auth')
      return authData ? JSON.parse(authData) : null
    } catch (error) {
      console.error('Error getting auth state from storage:', error)
      return null
    }
  },

  setAuthState: (authState: AuthState): void => {
    try {
      localStorage.setItem('auth', JSON.stringify(authState))
    } catch (error) {
      console.error('Error setting auth state in storage:', error)
    }
  },

  clearAuthState: (): void => {
    try {
      localStorage.removeItem('auth')
    } catch (error) {
      console.error('Error clearing auth state from storage:', error)
    }
  },
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from storage
  useEffect(() => {
    const storedAuth = storage.getAuthState()
    if (storedAuth) {
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: storedAuth.user!,
          tenant: storedAuth.tenant!,
          accessToken: storedAuth.accessToken!,
          refreshToken: storedAuth.refreshToken!,
        },
      })
    }
  }, [])

  // Update storage whenever auth state changes
  useEffect(() => {
    if (state.isAuthenticated) {
      storage.setAuthState(state)
    } else {
      storage.clearAuthState()
    }
  }, [state])

  // Auth methods
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' })

      const response = await api.post('/auth/login', credentials)

      if (response.success && response.data) {
        const { user, accessToken, refreshToken, tenant } = response.data

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tenant, accessToken, refreshToken },
        })

        toast.success(`Welcome back, ${user.firstName}!`)
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' })
      throw error
    }
  }

  const register = async (data: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' })

      const response = await api.post('/auth/register', data)

      if (response.success && response.data) {
        const { user, accessToken, refreshToken, tenant } = response.data

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tenant, accessToken, refreshToken },
        })

        toast.success('Registration successful! Please check your email for verification.')
      } else {
        throw new Error(response.error || 'Registration failed')
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' })
      throw error
    }
  }

  const logout = (): void => {
    dispatch({ type: 'LOGOUT' })
    storage.clearAuthState()
    toast.success('Logged out successfully')
  }

  const refreshToken = async (): Promise<void> => {
    if (!state.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: state.refreshToken,
      })

      if (response.success && response.data) {
        const { accessToken } = response.data
        dispatch({ type: 'REFRESH_TOKEN', payload: accessToken })
      } else {
        throw new Error(response.error || 'Token refresh failed')
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' })
      throw error
    }
  }

  const forgotPassword = async (email: string, tenantId: string): Promise<void> => {
    try {
      await api.post('/auth/forgot-password', { email, tenantId })
      toast.success('Password reset link sent to your email')
    } catch (error: any) {
      throw error
    }
  }

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/auth/reset-password', { token, newPassword })
      toast.success('Password reset successful')
    } catch (error: any) {
      throw error
    }
  }

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      await api.post('/auth/verify-email', { token })
      toast.success('Email verified successfully')
    } catch (error: any) {
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      toast.success('Password changed successfully')
    } catch (error: any) {
      throw error
    }
  }

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const response = await api.put('/auth/me', data)

      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data.user })
        toast.success('Profile updated successfully')
      }
    } catch (error: any) {
      throw error
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    verifyEmail,
    changePassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export for convenience
export { AuthContext }