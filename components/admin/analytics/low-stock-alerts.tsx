'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  Clock, 
  RefreshCw, 
  MoreVertical,
  AlertCircle,
  XCircle,
  CheckCircle
} from 'lucide-react'
import { useAnalytics } from '@/hooks/use-analytics'

interface LowStockAlertsProps {
  className?: string
  maxAlerts?: number
  showActions?: boolean
  compact?: boolean
}

export default function LowStockAlerts({ 
  className = '', 
  maxAlerts = 10,
  showActions = true,
  compact = false
}: LowStockAlertsProps) {
  const { data, loading, error } = useAnalytics()
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set())

  // Process and filter alerts
  const alerts = useMemo(() => {
    if (!data?.lowStockAlerts) return []

    let filtered = data.lowStockAlerts.slice(0, maxAlerts)

    // Apply urgency filter
    if (filterUrgency !== 'all') {
      filtered = filtered.filter(alert => alert.urgency === filterUrgency)
    }

    return filtered
  }, [data, maxAlerts, filterUrgency])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.lowStockAlerts) return { critical: 0, high: 0, medium: 0, low: 0, total: 0 }

    return data.lowStockAlerts.reduce(
      (acc, alert) => {
        acc[alert.urgency]++
        acc.total++
        return acc
      },
      { critical: 0, high: 0, medium: 0, low: 0, total: 0 }
    )
  }, [data])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200'
      case 'high':
        return 'text-amber-600 bg-amber-100 border-amber-200'
      case 'medium':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'low':
        return 'text-gray-600 bg-gray-100 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <XCircle className="w-4 h-4" />
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium':
        return <AlertCircle className="w-4 h-4" />
      case 'low':
        return <Clock className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStockPercentage = (current: number, min: number) => {
    if (current === 0) return 0
    return Math.min((current / min) * 100, 100)
  }

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(alertId)) {
        newSet.delete(alertId)
      } else {
        newSet.add(alertId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedAlerts.size === alerts.length) {
      setSelectedAlerts(new Set())
    } else {
      setSelectedAlerts(new Set(alerts.map(alert => alert.productId)))
    }
  }

  const handleBulkAction = (action: 'restock' | 'dismiss' | 'notify') => {
    console.log(`Bulk action: ${action} for alerts:`, Array.from(selectedAlerts))
    // Handle bulk action here
    setSelectedAlerts(new Set())
  }

  const handleSingleAction = (alertId: string, action: 'restock' | 'dismiss' | 'notify') => {
    console.log(`Single action: ${action} for alert:`, alertId)
    // Handle single action here
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Stock Alerts</h3>
          <AlertTriangle className="w-4 h-4 text-gray-400" />
        </div>

        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert, index) => (
            <motion.div
              key={alert.productId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                {alert.productImage ? (
                  <img
                    src={alert.productImage}
                    alt={alert.productName}
                    className="w-8 h-8 rounded object-cover mr-3"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                    {alert.productName}
                  </p>
                  <p className="text-xs text-gray-500">{alert.currentStock} left</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(alert.urgency)}`}>
                {alert.urgency}
              </div>
            </motion.div>
          ))}
        </div>

        {stats.total > 3 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {stats.total - 3} more items need attention
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
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
            <p className="text-sm text-gray-600">Products that need restocking</p>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            <p className="text-xs text-gray-600">Critical</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.high}</p>
            <p className="text-xs text-gray-600">High</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.medium}</p>
            <p className="text-xs text-gray-600">Medium</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-600">{stats.low}</p>
            <p className="text-xs text-gray-600">Low</p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filter by urgency:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { value: 'all', label: 'All' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
              ].map((urgency) => (
                <button
                  key={urgency.value}
                  onClick={() => setFilterUrgency(urgency.value as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterUrgency === urgency.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {urgency.label}
                </button>
              ))}
            </div>
          </div>

          {showActions && alerts.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedAlerts.size === alerts.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedAlerts.size > 0 && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleBulkAction('restock')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200"
                  >
                    Restock
                  </button>
                  <button
                    onClick={() => handleBulkAction('notify')}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                  >
                    Notify
                  </button>
                  <button
                    onClick={() => handleBulkAction('dismiss')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">All Stock Levels Good</h4>
            <p className="text-gray-600">No products need restocking at this time.</p>
          </div>
        ) : (
          alerts.map((alert, index) => {
            const stockPercentage = getStockPercentage(alert.currentStock, alert.minStock)
            const isSelected = selectedAlerts.has(alert.productId)

            return (
              <motion.div
                key={alert.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-6 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    {/* Checkbox */}
                    {showActions && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectAlert(alert.productId)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4"
                      />
                    )}

                    {/* Product Image */}
                    {alert.productImage ? (
                      <img
                        src={alert.productImage}
                        alt={alert.productName}
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{alert.productName}</h4>
                    <span className={`ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(alert.urgency)}`}>
                      {getUrgencyIcon(alert.urgency)}
                      <span className="ml-1 capitalize">{alert.urgency}</span>
                    </span>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Current Stock: {alert.currentStock}</span>
                      <span>Min Stock: {alert.minStock}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          alert.urgency === 'critical' ? 'bg-red-500' :
                          alert.urgency === 'high' ? 'bg-amber-500' :
                          alert.urgency === 'medium' ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Restock */}
                  {alert.lastRestock && (
                    <p className="text-xs text-gray-500">
                      Last restocked: {new Date(alert.lastRestock).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleSingleAction(alert.productId, 'restock')}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Restock"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSingleAction(alert.productId, 'notify')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Notify Supplier"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSingleAction(alert.productId, 'dismiss')}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    title="Dismiss Alert"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )
      })
    )}
  </div>

  {/* Footer */}
  {stats.total > 0 && (
    <div className="px-6 py-4 border-t border-gray-200">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{alerts.length} of {stats.total} alerts shown</span>
        <span>Updated {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  )}
</div>
)
}

/**
 * Mini version for dashboard widgets
 */
export function LowStockAlertsMini({ className = '' }: { className?: string }) {
  const { data, loading } = useAnalytics()

  const criticalAlerts = useMemo(() => {
    if (!data?.lowStockAlerts) return []
    return data.lowStockAlerts.filter(alert => alert.urgency === 'critical').slice(0, 3)
  }, [data])

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">Critical Stock</h4>
        <AlertTriangle className="w-4 h-4 text-red-500" />
      </div>

      {criticalAlerts.length === 0 ? (
        <div className="text-center py-4">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-xs text-gray-600">No critical alerts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {criticalAlerts.map((alert, index) => (
            <motion.div
              key={alert.productId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 bg-red-50 rounded"
            >
              <div className="flex items-center">
                {alert.productImage ? (
                  <img
                    src={alert.productImage}
                    alt={alert.productName}
                    className="w-6 h-6 rounded object-cover mr-2"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded mr-2 flex items-center justify-center">
                    <Package className="w-3 h-3 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-900 truncate max-w-20">
                    {alert.productName}
                  </p>
                  <p className="text-xs text-red-600">{alert.currentStock} left</p>
                </div>
              </div>
              <RefreshCw className="w-3 h-3 text-red-600" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
