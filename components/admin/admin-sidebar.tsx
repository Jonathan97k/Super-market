'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Tags,
  TrendingUp,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Store,
  HelpCircle,
  FileText
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { AuthUser } from '@/lib/auth'

interface SidebarProps {
  user: AuthUser | null
  onClose?: () => void
  isMobile?: boolean
}

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: string | number
  children?: NavItem[]
  requiredRole?: 'admin' | 'staff'
}

export default function AdminSidebar({ user, onClose, isMobile = false }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      requiredRole: 'staff'
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: Package,
      requiredRole: 'admin',
      children: [
        { name: 'All Products', href: '/admin/products', icon: Package },
        { name: 'Categories', href: '/admin/categories', icon: Tags },
        { name: 'Inventory', href: '/admin/inventory', icon: ShoppingCart }
      ]
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      requiredRole: 'staff',
      badge: '12'
    },
    {
      name: 'Customers',
      href: '/admin/customers',
      icon: Users,
      requiredRole: 'admin'
    },
    {
      name: 'Promotions',
      href: '/admin/promotions',
      icon: TrendingUp,
      requiredRole: 'admin'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      requiredRole: 'staff'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      requiredRole: 'admin',
      children: [
        { name: 'General', href: '/admin/settings', icon: Settings },
        { name: 'Store Info', href: '/admin/settings/store', icon: Store },
        { name: 'Payment', href: '/admin/settings/payment', icon: FileText },
        { name: 'Staff', href: '/admin/settings/staff', icon: Users }
      ]
    },
    {
      name: 'Help',
      href: '/admin/help',
      icon: HelpCircle,
      requiredRole: 'staff'
    }
  ]

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    if (!user) return false
    if (!item.requiredRole) return true
    if (item.requiredRole === 'admin') return user.role === 'admin'
    if (item.requiredRole === 'staff') return ['admin', 'staff'].includes(user.role)
    return true
  })

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      if (onClose) onClose()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    if (onClose) onClose()
  }

  const isActive = (href: string) => {
    if (href === pathname) return true
    if (pathname.startsWith(href + '/')) return true
    return false
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.name)
    const hasChildren = item.children && item.children.length > 0
    const active = isActive(item.href)

    return (
      <div key={item.name}>
        <motion.div
          whileHover={{ x: level === 0 ? 4 : 2 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer
            ${active
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            ${level > 0 ? 'ml-6' : ''}
          `}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.name)
            } else {
              handleNavigation(item.href)
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <item.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
            <span className="truncate">{item.name}</span>
            {item.badge && (
              <span className={`
                inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full
                ${active ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}
              `}>
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={`
      flex flex-col h-full bg-white border-r border-gray-200
      ${isMobile ? 'w-80' : 'w-64'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">VELOX MART</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.firstName && user?.lastName
              ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
              : user?.email?.slice(0, 2).toUpperCase() || 'U'
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email || 'Unknown User'
              }
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || 'User'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map(item => renderNavItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? 'Signing out...' : 'Sign Out'}
        </motion.button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Version 1.0.0
          </p>
          <p className="text-xs text-gray-400">
            © 2024 VELOX MART
          </p>
        </div>
      </div>
    </div>
  )
}
