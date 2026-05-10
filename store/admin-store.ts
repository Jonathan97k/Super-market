import { create } from 'zustand'

interface AdminStore {
  currentUser: AdminUser | null
  isAuthenticated: boolean
  permissions: string[]
  
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'staff'
  permissions: string[]
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  permissions: [],
  
  login: async (email: string, password: string) => {
    try {
      // Mock authentication - replace with actual Supabase auth
      if (email === 'admin@supermarket.com' && password === 'admin123') {
        const user: AdminUser = {
          id: '1',
          email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          permissions: ['products:read', 'products:write', 'categories:read', 'categories:write', 'orders:read', 'analytics:read'],
        }
        set({
          currentUser: user,
          isAuthenticated: true,
          permissions: user.permissions,
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  },
  
  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false,
      permissions: [],
    })
  },
  
  hasPermission: (permission: string) => {
    return get().permissions.includes(permission)
  },
}))
