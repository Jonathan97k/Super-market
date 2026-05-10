'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  ShoppingCart, 
  User, 
  Eye, 
  TrendingUp, 
  Clock, 
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Bell,
  MoreVertical
} from 'lucide-react'
import { useRealtimeActivity } from '@/hooks/use-analytics'

interface RealtimeActivityProps {
  className?: string
  maxItems?: number
  showFilters?: boolean
  compact?: boolean
  autoRefresh?: boolean
}

interface ActivityItem {
  id: string
  type: 'order' | 'customer' | 'product_view' | 'promotion_click' | 'stock_alert' | 'payment' | 'review'
  timestamp: string
  description: string
  data?: any
  userId?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

export default function RealtimeActivity({ 
  className = '', 
  maxItems = 20,
  showFilters = true,
  compact = false,
  autoRefresh = true
}: RealtimeActivityProps) {
  const { activities, isConnected } = useRealtimeActivity()
  const [filterType, setFilterType] = useState<'all' | ActivityItem['type']>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all')
  const [isPaused, setIsPaused] = useState(false)

  // Mock additional activities for demonstration
  const mockActivities = useMemo(() => {
    const activities: ActivityItem[] = []
    const types: ActivityItem['type'][] = ['order', 'customer', 'product_view', 'promotion_click', 'stock_alert', 'payment', 'review']
    const priorities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical']
    
    for (let i = 0; i < 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)]
      const priority = priorities[Math.floor(Math.random() * priorities.length)]
      const timestamp = new Date(Date.now() - Math.random() * 3600000).toISOString()
      
      let description = ''
      let data: any = {}
      
      switch (type) {
        case 'order':
          description = `New order #${1000 + i} placed`
          data = { orderId: 1000 + i, amount: Math.floor(Math.random() * 10000) + 1000 }
          break
        case 'customer':
          description = `New customer registered`
          data = { customerId: `cust_${i}`, email: `customer${i}@example.com` }
          break
        case 'product_view':
          description = `Product viewed: Fresh Milk ${i + 1}L`
          data = { productId: `prod_${i}`, productName: `Fresh Milk ${i + 1}L` }
          break
        case 'promotion_click':
          description = `Flash Sale promotion clicked`
          data = { promotionId: `promo_${i}`, promotionType: 'flash_sale' }
          break
        case 'stock_alert':
          description = `Low stock alert: Bread ${i + 1} pack`
          data = { productId: `prod_${i}`, currentStock: Math.floor(Math.random() * 10), minStock: 20 }
          break
        case 'payment':
          description = `Payment received for order #${1000 + i}`
          data = { orderId: 1000 + i, amount: Math.floor(Math.random() * 10000) + 1000, method: 'mobile_money' }
          break
        case 'review':
          description = `New 5-star review received`
          data = { productId: `prod_${i}`, rating: 5, reviewId: `review_${i}` }
          break
      }
      
      activities.push({
        id: `activity_${i}`,
        type,
        timestamp,
        description,
        data,
        priority
      })
    }
    
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [])

  // Combine real and mock activities
  const allActivities = useMemo(() => {
    const combined = [...mockActivities, ...activities]
    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [mockActivities, activities])

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = allActivities

    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType)
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(activity => activity.priority === filterPriority)
    }

    return filtered.slice(0, maxItems)
  }, [allActivities, filterType, filterPriority, maxItems])

  // Calculate statistics
  const stats = useMemo(() => {
    const lastHour = new Date(Date.now() - 3600000)
    const recentActivities = allActivities.filter(activity => 
      new Date(activity.timestamp) > lastHour
    )

    return {
      total: allActivities.length,
      lastHour: recentActivities.length,
      byType: {
        orders: allActivities.filter(a => a.type === 'order').length,
        customers: allActivities.filter(a => a.type === 'customer').length,
        views: allActivities.filter(a => a.type === 'product_view').length,
        alerts: allActivities.filter(a => a.type === 'stock_alert').length
      },
      byPriority: {
        critical: allActivities.filter(a => a.priority === 'critical').length,
        high: allActivities.filter(a => a.priority === 'high').length,
        medium: allActivities.filter(a => a.priority === 'medium').length,
        low: allActivities.filter(a => a.priority === 'low').length
      }
    }
  }, [allActivities])

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4" />
      case 'customer':
        return <User className="w-4 h-4" />
      case 'product_view':
        return <Eye className="w-4 h-4" />
      case 'promotion_click':
        return <TrendingUp className="w-4 h-4" />
      case 'stock_alert':
        return <AlertTriangle className="w-4 h-4" />
      case 'payment':
        return <CheckCircle className="w-4 h-4" />
      case 'review':
        return <Package className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return 'text-blue-600 bg-blue-100'
      case 'customer':
        return 'text-green-600 bg-green-100'
      case 'product_view':
        return 'text-purple-600 bg-purple-100'
      case 'promotion_click':
        return 'text-amber-600 bg-amber-100'
      case 'stock_alert':
        return 'text-red-600 bg-red-100'
      case 'payment':
        return 'text-indigo-600 bg-indigo-100'
      case 'review':
        return 'text-pink-600 bg-pink-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50'
      case 'high':
        return 'border-amber-500 bg-amber-50'
      case 'medium':
        return 'border-blue-500 bg-blue-50'
      case 'low':
        return 'border-gray-300 bg-gray-50'
      default:
        return 'border-gray-300 bg-white'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffMs = now.getTime() - activityTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return `${Math.floor(diffMins / 1440)} days ago`
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Live Activity</h3>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          {filteredActivities.slice(0, 5).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <div className={`p-1.5 rounded-lg ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 truncate">{activity.description}</p>
                <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {stats.lastHour > 5 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {stats.lastHour} activities in the last hour
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Realtime Activity</h3>
            <p className="text-sm text-gray-600">Live system activity feed</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-xs text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Pause/Resume */}
            <button
              onClick={handlePause}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              {isPaused ? <RefreshCw className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.byType.orders}</p>
            <p className="text-xs text-gray-600">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.byType.customers}</p>
            <p className="text-xs text-gray-600">Customers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.byType.views}</p>
            <p className="text-xs text-gray-600">Views</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.byType.alerts}</p>
            <p className="text-xs text-gray-600">Alerts</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Type:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'order', label: 'Orders' },
                    { value: 'customer', label: 'Customers' },
                    { value: 'product_view', label: 'Views' },
                    { value: 'stock_alert', label: 'Alerts' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFilterType(type.value as any)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        filterType === type.value
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Priority:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'critical', label: 'Critical' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' }
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      onClick={() => setFilterPriority(priority.value as any)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        filterPriority === priority.value
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {filteredActivities.length} of {allActivities.length} shown
              </span>
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(activity.priority)}`}
            >
              <div className="flex items-start space-x-3">
                {/* Activity Icon */}
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)} flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {activity.data && (
                    <div className="mt-2">
                      {activity.type === 'order' && (
                        <p className="text-xs text-gray-600">
                          Order #{activity.data.orderId} • {new Intl.NumberFormat('en-MW', {
                            style: 'currency',
                            currency: 'MWK',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(activity.data.amount)}
                        </p>
                      )}
                      {activity.type === 'customer' && (
                        <p className="text-xs text-gray-600">
                          ID: {activity.data.customerId}
                        </p>
                      )}
                      {activity.type === 'product_view' && (
                        <p className="text-xs text-gray-600">
                          {activity.data.productName}
                        </p>
                      )}
                      {activity.type === 'stock_alert' && (
                        <p className="text-xs text-gray-600">
                          Stock: {activity.data.currentStock}/{activity.data.minStock}
                        </p>
                      )}
                      {activity.type === 'payment' && (
                        <p className="text-xs text-gray-600">
                          Order #{activity.data.orderId} • {new Intl.NumberFormat('en-MW', {
                            style: 'currency',
                            currency: 'MWK',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(activity.data.amount)} • {activity.data.method}
                        </p>
                      )}
                    </div>
                  )}

                  {/* User Info */}
                  {activity.userId && (
                    <div className="mt-2 flex items-center">
                      <User className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">User {activity.userId}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>{stats.lastHour} activities in last hour</span>
            <span>•</span>
            <span>{stats.byPriority.critical + stats.byPriority.high} high priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${isPaused ? 'text-amber-600' : 'text-green-600'}`}>
              {isPaused ? 'Paused' : 'Live'}
            </span>
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-green-500'} ${!isPaused && 'animate-pulse'}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Mini activity ticker for dashboard
 */
export function ActivityTicker({ className = '' }: { className?: string }) {
  const { activities, isConnected } = useRealtimeActivity()
  
  const recentActivities = useMemo(() => {
    return activities.slice(0, 3)
  }, [activities])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-3 h-3" />
      case 'customer':
        return <User className="w-3 h-3" />
      case 'product_view':
        return <Eye className="w-3 h-3" />
      default:
        return <Activity className="w-3 h-3" />
    }
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Recent Activity</h4>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <Activity className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="space-y-2">
        {recentActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2"
          >
            <div className="p-1 bg-blue-100 rounded text-blue-600">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-900 truncate">{activity.description}</p>
              <p className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
