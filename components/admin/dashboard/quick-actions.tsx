'use client'

import { motion } from 'framer-motion'
import { Plus, Tag, Grid3X3, ShoppingCart, Package, TrendingUp, Users, Settings } from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  color: string
  href: string
  badge?: string
}

export default function QuickActions() {
  const quickActions: QuickAction[] = [
    {
      id: 'add-product',
      title: 'Add Product',
      description: 'Create a new product listing',
      icon: Package,
      color: 'blue',
      href: '/admin/products/new',
      badge: 'New'
    },
    {
      id: 'add-promotion',
      title: 'Add Promotion',
      description: 'Create a discount campaign',
      icon: Tag,
      color: 'green',
      href: '/admin/promotions/new'
    },
    {
      id: 'manage-categories',
      title: 'Manage Categories',
      description: 'Organize product categories',
      icon: Grid3X3,
      color: 'purple',
      href: '/admin/categories'
    },
    {
      id: 'view-orders',
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: ShoppingCart,
      color: 'orange',
      href: '/admin/orders',
      badge: '15'
    },
    {
      id: 'inventory-report',
      title: 'Inventory Report',
      description: 'Generate stock analysis',
      icon: TrendingUp,
      color: 'indigo',
      href: '/admin/analytics/inventory'
    },
    {
      id: 'customer-management',
      title: 'Customers',
      description: 'Manage customer data',
      icon: Users,
      color: 'pink',
      href: '/admin/customers'
    },
    {
      id: 'store-settings',
      title: 'Store Settings',
      description: 'Configure store preferences',
      icon: Settings,
      color: 'gray',
      href: '/admin/settings'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        hoverBg: 'hover:bg-blue-100',
        icon: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-50',
        hoverBg: 'hover:bg-green-100',
        icon: 'text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-50',
        hoverBg: 'hover:bg-purple-100',
        icon: 'text-purple-600',
        border: 'border-purple-200'
      },
      orange: {
        bg: 'bg-orange-50',
        hoverBg: 'hover:bg-orange-100',
        icon: 'text-orange-600',
        border: 'border-orange-200'
      },
      indigo: {
        bg: 'bg-indigo-50',
        hoverBg: 'hover:bg-indigo-100',
        icon: 'text-indigo-600',
        border: 'border-indigo-200'
      },
      pink: {
        bg: 'bg-pink-50',
        hoverBg: 'hover:bg-pink-100',
        icon: 'text-pink-600',
        border: 'border-pink-200'
      },
      gray: {
        bg: 'bg-gray-50',
        hoverBg: 'hover:bg-gray-100',
        icon: 'text-gray-600',
        border: 'border-gray-200'
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const handleActionClick = (href: string) => {
    // In a real app, this would use Next.js router
    console.log('Navigate to:', href)
    // For demo purposes, we'll just show an alert
    alert(`Would navigate to: ${href}`)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Quick Actions</h2>
          <p className="text-sm text-gray-500">Common tasks and shortcuts</p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 gap-3">
        {quickActions.map((action, index) => {
          const colors = getColorClasses(action.color)
          const Icon = action.icon

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleActionClick(action.href)}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl border transition-all
                ${colors.bg} ${colors.border} ${colors.hoverBg}
                hover:shadow-md
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
              
              {action.badge && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {action.badge}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Recent Activity Summary */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <h3 className="font-medium text-gray-900 mb-2">Recent Activity</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Products added today</span>
              <span className="font-medium text-gray-900">3</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Orders processed</span>
              <span className="font-medium text-gray-900">15</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Promotions active</span>
              <span className="font-medium text-gray-900">8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">Need help getting started?</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            View Tutorial
          </motion.button>
        </div>
      </div>
    </div>
  )
}
