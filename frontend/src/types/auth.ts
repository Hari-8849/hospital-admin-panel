export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
  PHARMACIST = 'PHARMACIST',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  BILLING_STAFF = 'BILLING_STAFF',
  PATIENT = 'PATIENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: UserRole
  permissions: string[]
  status: UserStatus
  lastLoginAt?: string
  isEmailVerified: boolean
  emailVerifiedAt?: string
  mustChangePassword: boolean
  profile?: Record<string, any>
  preferences?: Record<string, any>
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  identifier: string
  name: string
  description?: string
  email: string
  phone: string
  website?: string
  logo?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  settings?: Record<string, any>
  isActive: boolean
  isOnTrial: boolean
  trialEndsAt?: string
  schemaName?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  tenant: Tenant
}

export interface LoginCredentials {
  email: string
  password: string
  tenantId: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  role: UserRole
  tenantId: string
}

export interface AuthState {
  user: User | null
  tenant: Tenant | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  forgotPassword: (email: string, tenantId: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}