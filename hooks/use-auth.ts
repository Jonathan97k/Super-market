'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authManager, AuthUser, AuthError } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        const { user, error } = await authManager.getCurrentUser()
        
        if (user) {
          setUser(user)
        }
        
        if (error) {
          setError(error)
        }
      } catch (err) {
        setError({
          message: err instanceof Error ? err.message : 'Failed to initialize authentication'
        })
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { user, error } = await authManager.signIn(email, password)
      
      if (user) {
        setUser(user)
        return { success: true, user }
      }
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      return { success: false, error: { message: 'Login failed' } }
    } catch (err) {
      const authError = {
        message: err instanceof Error ? err.message : 'Login failed'
      }
      setError(authError)
      return { success: false, error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      
      const { error } = await authManager.signOut()
      
      if (!error) {
        setUser(null)
        setError(null)
        router.push('/admin/login')
      } else {
        setError(error)
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Logout failed'
      })
    } finally {
      setLoading(false)
    }
  }, [router])

  // Register function
  const register = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      setLoading(true)
      setError(null)
      
      const { user, error } = await authManager.signUp(email, password, metadata)
      
      if (user) {
        setUser(user)
        return { success: true, user }
      }
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      return { success: false, error: { message: 'Registration failed' } }
    } catch (err) {
      const authError = {
        message: err instanceof Error ? err.message : 'Registration failed'
      }
      setError(authError)
      return { success: false, error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset password function
  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await authManager.resetPassword(email)
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      return { success: true }
    } catch (err) {
      const authError = {
        message: err instanceof Error ? err.message : 'Password reset failed'
      }
      setError(authError)
      return { success: false, error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  // Update password function
  const updatePassword = useCallback(async (password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await authManager.updatePassword(password)
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      return { success: true }
    } catch (err) {
      const authError = {
        message: err instanceof Error ? err.message : 'Password update failed'
      }
      setError(authError)
      return { success: false, error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  // Update profile function
  const updateProfile = useCallback(async (updates: Partial<AuthUser>) => {
    try {
      setLoading(true)
      setError(null)
      
      const { user: updatedUser, error } = await authManager.updateProfile(updates)
      
      if (updatedUser) {
        setUser(updatedUser)
        return { success: true, user: updatedUser }
      }
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      return { success: false, error: { message: 'Profile update failed' } }
    } catch (err) {
      const authError = {
        message: err instanceof Error ? err.message : 'Profile update failed'
      }
      setError(authError)
      return { success: false, error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh session function
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { user: refreshedUser, error } = await authManager.refreshSession()
      
      if (refreshedUser) {
        setUser(refreshedUser)
        return { success: true, user: refreshedUser }
      }
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      return { success: false, error: { message: 'Session refresh failed' } }
    } catch (err) {
      const authError = {
        message: err instanceof Error ? err.message : 'Session refresh failed'
      }
      setError(authError)
      return { success: false, error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear error function
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  // Check if user is staff or admin
  const isStaff = user?.role === 'admin' || user?.role === 'staff'

  // Get user display name
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.email || 'Unknown User'

  // Get user initials for avatar
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U'

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin,
    isStaff,
    
    // Derived values
    displayName,
    initials,
    
    // Actions
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    clearError,
    
    // Utilities
    getUser: () => user,
    isLoading: loading,
    hasError: !!error,
    getError: () => error
  }
}

// Hook for admin-only routes
export function useAdminAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.loading && (!auth.isAuthenticated || !auth.isAdmin)) {
      // Redirect to login if not admin
      window.location.href = '/admin/login'
    }
  }, [auth.isAuthenticated, auth.isAdmin, auth.loading])
  
  return auth
}

// Hook for staff routes (admin or staff)
export function useStaffAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.loading && (!auth.isAuthenticated || !auth.isStaff)) {
      // Redirect to login if not staff
      window.location.href = '/admin/login'
    }
  }, [auth.isAuthenticated, auth.isStaff, auth.loading])
  
  return auth
}

export default useAuth
