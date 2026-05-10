'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Package, ShoppingCart, Tag, Users, Settings, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'product' | 'order' | 'promotion' | 'customer' | 'system' | 'inventory'
  title: string
  description: string
  user: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
  metadata?: {
    productName?: string
    orderId?: string
    customerName?: string
    quantity?: number
    amount?: number
  }
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Generate mock activity data
  const generateActivities = (): ActivityItem[] => {
    const activities: ActivityItem[] = [
      {
        id: '1',
        type: 'product',
        title: 'New Product Added',
        description: 'Fresh Milk 1L was added to inventory',
        user: 'John Admin',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'success',
        metadata: {
          productName: 'Fresh Milk 1L',
          quantity: 50
        }
      },
      {
        id: '2',
        type: 'order',
        title: 'Order Confirmed',
        description: 'Order #1234 has been confirmed and processed',
        user: 'Sarah Manager',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'success',
        metadata: {
          orderId: 'ORD-1234',
          amount: 15450,
          customerName: 'Jane Smith'
        }
      },
      {
        id: '3',
        type: 'promotion',
        title: 'Promotion Created',
        description: 'Weekend Sale promotion was created with 20% discount',
        user: 'Mike Admin',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'info',
        metadata: {
          productName: 'Weekend Sale'
        }
      },
      {
        id: '4',
        type: 'inventory',
        title: 'Low Stock Alert',
        description: 'Chicken Breast is running low (5 units remaining)',
        user: 'System',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'warning',
        metadata: {
          productName: 'Chicken Breast',
          quantity: 5
        }
      },
      {
        id: '5',
        type: 'customer',
        title: 'New Customer Registered',
        description: 'Robert Johnson joined as a new customer',
        user: 'System',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'success',
        metadata: {
          customerName: 'Robert Johnson'
        }
      },
      {
        id: '6',
        type: 'order',
        title: 'Order Delivered',
        description: 'Order #1232 was successfully delivered',
        user: 'Delivery Team',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        status: 'success',
        metadata: {
          orderId: 'ORD-1232',
          customerName: 'Mary Williams'
        }
      },
      {
        id: '7',
        type: 'system',
        title: 'Backup Completed',
        description: 'Daily database backup completed successfully',
        user: 'System',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '8',
        type: 'product',
        title: 'Product Updated',
        description: 'Price updated for Bread Loaf',
        user: 'John Admin',
        timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
        status: 'info',
        metadata: {
          productName: 'Bread Loaf'
        }
      }
    ]

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setActivities(generateActivities())
      setIsLoading(false)
    }

    loadActivities()
  }, [])

  const getActivityIcon = (type: ActivityItem['type']) => {
    const icons = {
      product: Package,
      order: ShoppingCart,
      promotion: Tag,
      customer: Users,
      system: Settings,
      inventory: AlertCircle
    }
    return icons[type] || Activity
  }

  const getStatusColor = (status: ActivityItem['status']) => {
    const colors = {
      success: 'text-green-600 bg-green-50 border-green-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      error: 'text-red-600 bg-red-50 border-red-200',
      info: 'text-blue-600 bg-blue-50 border-blue-200'
    }
    return colors[status]
  }

  const getStatusIcon = (status: ActivityItem['status']) => {
    const icons = {
      success: CheckCircle,
      warning: AlertCircle,
      error: AlertCircle,
      info: Activity
    }
    return icons[status]
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Activity Feed</h2>
          <p className="text-sm text-gray-500">Recent system and user activities</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          View All Activity
        </motion.button>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type)
          const StatusIcon = getStatusIcon(activity.status)
          const statusColors = getStatusColor(activity.status)

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Activity Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusColors.split(' ')[1]}`}>
                <Icon className={`w-4 h-4 ${statusColors.split(' ')[0]}`} />
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">
                        by {activity.user}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Status Icon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${statusColors.split(' ')[1]}`}>
                    <StatusIcon className={`w-3 h-3 ${statusColors.split(' ')[0]}`} />
                  </div>
                </div>

                {/* Metadata */}
                {activity.metadata && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activity.metadata.productName && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        <Package className="w-3 h-3 mr-1" />
                        {activity.metadata.productName}
                      </span>
                    )}
                    {activity.metadata.orderId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        {activity.metadata.orderId}
                      </span>
                    )}
                    {activity.metadata.customerName && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        <Users className="w-3 h-3 mr-1" />
                        {activity.metadata.customerName}
                      </span>
                    )}
                    {activity.metadata.quantity && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        Qty: {activity.metadata.quantity}
                      </span>
                    )}
                    {activity.metadata.amount && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        MK {activity.metadata.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Load More */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Load More Activities
        </motion.button>
      </div>

      {/* Activity Stats */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1"></div>
            <p className="text-xs text-gray-500">Success</p>
            <p className="text-sm font-medium text-gray-900">
              {activities.filter(a => a.status === 'success').length}
            </p>
          </div>
          <div className="text-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mx-auto mb-1"></div>
            <p className="text-xs text-gray-500">Warnings</p>
            <p className="text-sm font-medium text-gray-900">
              {activities.filter(a => a.status === 'warning').length}
            </p>
          </div>
          <div className="text-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mb-1"></div>
            <p className="text-xs text-gray-500">Errors</p>
            <p className="text-sm font-medium text-gray-900">
              {activities.filter(a => a.status === 'error').length}
            </p>
          </div>
          <div className="text-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-1"></div>
            <p className="text-xs text-gray-500">Info</p>
            <p className="text-sm font-medium text-gray-900">
              {activities.filter(a => a.status === 'info').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
