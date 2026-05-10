import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  cartOpen: boolean
  mobileMenuOpen: boolean
  theme: 'light' | 'dark'
  loading: boolean
  notifications: Notification[]
  
  toggleSidebar: () => void
  toggleCart: () => void
  toggleMobileMenu: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLoading: (loading: boolean) => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarOpen: false,
  cartOpen: false,
  mobileMenuOpen: false,
  theme: 'light',
  loading: false,
  notifications: [],
  
  toggleSidebar: () => {
    set({ sidebarOpen: !get().sidebarOpen })
  },
  
  toggleCart: () => {
    set({ cartOpen: !get().cartOpen })
  },
  
  toggleMobileMenu: () => {
    set({ mobileMenuOpen: !get().mobileMenuOpen })
  },
  
  setTheme: (theme) => {
    set({ theme })
  },
  
  setLoading: (loading) => {
    set({ loading })
  },
  
  addNotification: (notification) => {
    const id = Date.now().toString()
    const newNotification = { ...notification, id }
    set({ notifications: [...get().notifications, newNotification] })
    
    if (notification.duration) {
      setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration)
    }
  },
  
  removeNotification: (id) => {
    set({
      notifications: get().notifications.filter((n) => n.id !== id),
    })
  },
}))
