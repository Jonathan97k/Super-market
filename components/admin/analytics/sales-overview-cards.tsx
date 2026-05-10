'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { useAnalyticsMetrics } from '@/hooks/use-analytics'

interface MetricCard {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color: 'green' | 'blue' | 'purple' | 'amber' | 'red'
  loading?: boolean
}

interface SalesOverviewCardsProps {
  className?: string
  compact?: boolean
}

export default function SalesOverviewCards({ 
  className = '', 
  compact = false 
}: SalesOverviewCardsProps) {
  const { metrics, loading } = useAnalyticsMetrics()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-MW').format(num)
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  const getCardColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-gradient-to-br from-green-500 to-green-600'
      case 'blue':
        return 'bg-gradient-to-br from-blue-500 to-blue-600'
      case 'purple':
        return 'bg-gradient-to-br from-purple-500 to-purple-600'
      case 'amber':
        return 'bg-gradient-to-br from-amber-500 to-amber-600'
      case 'red':
        return 'bg-gradient-to-br from-red-500 to-red-600'
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600'
    }
  }

  const cards: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      change: 12.5, // Mock growth percentage
      changeLabel: 'vs yesterday',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green',
      loading
    },
    {
      title: 'Total Orders',
      value: formatNumber(metrics.totalOrders),
      change: 8.3,
      changeLabel: 'vs yesterday',
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'blue',
      loading
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(metrics.averageOrderValue),
      change: -2.1,
      changeLabel: 'vs yesterday',
      icon: <Package className="w-5 h-5" />,
      color: 'purple',
      loading
    },
    {
      title: 'Total Customers',
      value: formatNumber(metrics.totalCustomers),
      change: 15.7,
      changeLabel: 'vs yesterday',
      icon: <Users className="w-5 h-5" />,
      color: 'amber',
      loading
    },
    {
      title: 'Low Stock Items',
      value: formatNumber(metrics.lowStockCount),
      change: metrics.lowStockCount > 0 ? -5 : 0,
      changeLabel: 'items need restock',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: metrics.lowStockCount > 0 ? 'red' : 'green',
      loading
    },
    {
      title: 'Pending Orders',
      value: formatNumber(metrics.pendingOrders),
      change: metrics.pendingOrders > 0 ? 0 : -10,
      changeLabel: 'awaiting processing',
      icon: <Clock className="w-5 h-5" />,
      color: metrics.pendingOrders > 0 ? 'amber' : 'green',
      loading
    }
  ]

  if (compact) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${getCardColor(card.color)} bg-opacity-10`}>
                <div className={`${getCardColor(card.color).replace('bg-', 'text-')} bg-opacity-100`}>
                  {card.icon}
                </div>
              </div>
              {card.change !== undefined && (
                <div className={`flex items-center text-xs ${getChangeColor(card.change)}`}>
                  {getChangeIcon(card.change)}
                  <span className="ml-1">{Math.abs(card.change)}%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">{card.title}</p>
              <p className="text-lg font-bold text-gray-900">
                {loading ? (
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </p>
              {card.changeLabel && (
                <p className="text-xs text-gray-500 mt-1">{card.changeLabel}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ y: -5, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
          className="bg-white rounded-2xl border border-gray-200 p-6 relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className={`absolute top-0 right-0 w-32 h-32 ${getCardColor(card.color)} opacity-5 rounded-full -mr-16 -mt-16`} />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                )}
              </div>
              
              <div className={`p-3 rounded-xl ${getCardColor(card.color)} bg-opacity-10`}>
                <div className={`${getCardColor(card.color).replace('bg-', 'text-')} bg-opacity-100`}>
                  {card.icon}
                </div>
              </div>
            </div>

            {/* Change indicator */}
            {card.change !== undefined && (
              <div className="flex items-center justify-between">
                <div className={`flex items-center ${getChangeColor(card.change)}`}>
                  {getChangeIcon(card.change)}
                  <span className="ml-1 text-sm font-medium">
                    {card.change > 0 ? '+' : ''}{card.change}%
                  </span>
                </div>
                
                <span className="text-xs text-gray-500">{card.changeLabel}</span>
              </div>
            )}

            {/* Progress bar for visual representation */}
            {!loading && (
              <div className="mt-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(card.change || 0) * 5, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    className={`h-full ${getCardColor(card.color)}`}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Minimal version for sidebar
 */
export function SalesOverviewCardsMinimal({ className = '' }: { className?: string }) {
  const { metrics, loading } = useAnalyticsMetrics()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-MW').format(num)
  }

  const minimalCards = [
    {
      title: 'Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: <DollarSign className="w-4 h-4" />,
      color: 'text-green-600'
    },
    {
      title: 'Orders',
      value: formatNumber(metrics.totalOrders),
      icon: <ShoppingCart className="w-4 h-4" />,
      color: 'text-blue-600'
    },
    {
      title: 'Customers',
      value: formatNumber(metrics.totalCustomers),
      icon: <Users className="w-4 h-4" />,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {minimalCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-white mr-3 ${card.color} bg-opacity-10`}>
              <div className={card.color}>{card.icon}</div>
            </div>
            <div>
              <p className="text-xs text-gray-600">{card.title}</p>
              <p className="text-lg font-bold text-gray-900">
                {loading ? (
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
                ) : (
                  card.value
                )}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Single metric card for specific use cases
 */
export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'blue',
  loading = false,
  className = ''
}: MetricCard & { className?: string }) {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  const getCardColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-gradient-to-br from-green-500 to-green-600'
      case 'blue':
        return 'bg-gradient-to-br from-blue-500 to-blue-600'
      case 'purple':
        return 'bg-gradient-to-br from-purple-500 to-purple-600'
      case 'amber':
        return 'bg-gradient-to-br from-amber-500 to-amber-600'
      case 'red':
        return 'bg-gradient-to-br from-red-500 to-red-600'
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
      className={`bg-white rounded-2xl border border-gray-200 p-6 relative overflow-hidden ${className}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${getCardColor(color)} opacity-5 rounded-full -mr-16 -mt-16`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            )}
          </div>
          
          <div className={`p-3 rounded-xl ${getCardColor(color)} bg-opacity-10`}>
            <div className={`${getCardColor(color).replace('bg-', 'text-')} bg-opacity-100`}>
              {icon}
            </div>
          </div>
        </div>

        {change !== undefined && (
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${getChangeColor(change)}`}>
              {getChangeIcon(change)}
              <span className="ml-1 text-sm font-medium">
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
            
            {changeLabel && (
              <span className="text-xs text-gray-500">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
