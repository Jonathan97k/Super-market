import { getPocketBaseClient } from './pocketbase/client'

// Environment variables for PocketBase
const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL

if (!pocketbaseUrl) {
  console.warn('Missing PocketBase environment variables (NEXT_PUBLIC_POCKETBASE_URL)')
}

// Use the centralized client for general auth
const pocketbase = getPocketBaseClient()
pocketbase.autoCancellation(false)

// Create server-side PocketBase client for middleware
export async function createServerPocketBaseClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()
  const pb = getPocketBaseClient()

  // Load auth token from cookies
  const authCookie = cookieStore.get('pb_auth')
  if (authCookie) {
    pb.authStore.loadFromCookie(authCookie.value)
  }

  pb.autoCancellation(false)
  return pb
}

// Authentication types
export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'staff' | 'user'
  firstName?: string
  lastName?: string
  avatar?: string
  lastLogin?: string
}

export interface AuthSession {
  user: AuthUser
  token: string
  expiresAt: number
}

export interface AuthError {
  message: string
  code?: string
  status?: number
}

// Authentication utilities
export class AuthManager {
  private static instance: AuthManager

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const authData = await pocketbase.collection('users').authWithPassword(email, password)

      if (!authData.record) {
        return {
          user: null,
          error: { message: 'No user data returned' }
        }
      }

      const record = authData.record as any
      const authUser: AuthUser = {
        id: record.id,
        email: record.email,
        role: record.role || 'user',
        firstName: record.first_name,
        lastName: record.last_name,
        avatar: record.avatar_url
      }

      // Update last login
      try {
        await pocketbase.collection('users').update(record.id, {
          last_login: new Date().toISOString()
        })
      } catch (err) {
        console.error('Failed to update last login:', err)
      }

      return {
        user: authUser,
        error: null
      }
    } catch (err: any) {
      return {
        user: null,
        error: {
          message: err.message || 'Authentication failed',
          code: err.status ? err.status.toString() : undefined,
          status: err.status
        }
      }
    }
  }

  // Sign up with email and password
  async signUp(email: string, password: string, metadata?: Record<string, any>): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const userData = {
        email,
        password,
        passwordConfirm: password,
        emailVisibility: true,
        role: metadata?.role || 'user',
        first_name: metadata?.first_name,
        last_name: metadata?.last_name,
        avatar_url: metadata?.avatar_url,
        created_at: new Date().toISOString()
      }

      const record = await pocketbase.collection('users').create(userData)

      const authUser: AuthUser = {
        id: record.id,
        email: record.email,
        role: record.role || 'user',
        firstName: record.first_name,
        lastName: record.last_name,
        avatar: record.avatar_url
      }

      return {
        user: authUser,
        error: null
      }
    } catch (err: any) {
      return {
        user: null,
        error: {
          message: err.message || 'Registration failed',
          code: err.status ? err.status.toString() : undefined,
          status: err.status
        }
      }
    }
  }

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      pocketbase.authStore.clear()
      return { error: null }
    } catch (err: any) {
      return {
        error: {
          message: err.message || 'Sign out failed'
        }
      }
    }
  }

  // Get current user
  async getCurrentUser(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      if (!pocketbase.authStore.isValid) {
        return { user: null, error: null }
      }

      const record = pocketbase.authStore.model as any
      if (!record) {
        return { user: null, error: null }
      }

      const authUser: AuthUser = {
        id: record.id,
        email: record.email,
        role: record.role || 'user',
        firstName: record.first_name,
        lastName: record.last_name,
        avatar: record.avatar_url,
        lastLogin: record.last_login
      }

      return {
        user: authUser,
        error: null
      }
    } catch (err: any) {
      return {
        user: null,
        error: {
          message: err.message || 'Failed to get current user'
        }
      }
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      await pocketbase.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (err: any) {
      return {
        error: {
          message: err.message || 'Password reset failed',
          code: err.status ? err.status.toString() : undefined,
          status: err.status
        }
      }
    }
  }

  // Update password
  async updatePassword(password: string, currentPassword: string): Promise<{ error: AuthError | null }> {
    try {
      await pocketbase.collection('users').update(pocketbase.authStore.model?.id, {
        password,
        passwordConfirm: password,
        oldPassword: currentPassword
      })
      return { error: null }
    } catch (err: any) {
      return {
        error: {
          message: err.message || 'Password update failed',
          code: err.status ? err.status.toString() : undefined,
          status: err.status
        }
      }
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const userId = pocketbase.authStore.model?.id
      if (!userId) {
        return {
          user: null,
          error: { message: 'User not found' }
        }
      }

      const data = await pocketbase.collection('users').update(userId, {
        first_name: updates.firstName,
        last_name: updates.lastName,
        avatar_url: updates.avatar,
        updated_at: new Date().toISOString()
      })

      const updatedUser: AuthUser = {
        id: data.id,
        email: data.email,
        role: data.role,
        firstName: data.first_name,
        lastName: data.last_name,
        avatar: data.avatar_url
      }

      return {
        user: updatedUser,
        error: null
      }
    } catch (err: any) {
      return {
        user: null,
        error: {
          message: err.message || 'Profile update failed',
          code: err.status ? err.status.toString() : undefined,
          status: err.status
        }
      }
    }
  }

  // Check if user has admin role
  async isAdmin(): Promise<boolean> {
    const { user, error } = await this.getCurrentUser()
    return !error && user?.role === 'admin'
  }

  // Check if user has staff or admin role
  async isStaff(): Promise<boolean> {
    const { user, error } = await this.getCurrentUser()
    return !error && (user?.role === 'admin' || user?.role === 'staff')
  }

  // Validate session
  async validateSession(): Promise<{ valid: boolean; user: AuthUser | null }> {
    try {
      if (!pocketbase.authStore.isValid) {
        return { valid: false, user: null }
      }

      const { user } = await this.getCurrentUser()
      
      return {
        valid: !!user,
        user
      }
    } catch (err) {
      return { valid: false, user: null }
    }
  }

  // Refresh session
  async refreshSession(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      // PocketBase handles token refresh automatically
      const { user } = await this.getCurrentUser()
      
      return {
        user,
        error: null
      }
    } catch (err: any) {
      return {
        user: null,
        error: {
          message: err.message || 'Session refresh failed'
        }
      }
    }
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance()

// Utility functions
export function getAuthError(error: any): AuthError {
  if (typeof error === 'string') {
    return { message: error }
  }
  
  if (error?.message) {
    return {
      message: error.message,
      code: error.code,
      status: error.status
    }
  }
  
  return { message: 'An unknown error occurred' }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export default authManager
