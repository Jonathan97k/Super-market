'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  activePromotions: number
  pendingOrders: number
  totalStockValue: number
  lowStockCount: number
  outOfStockCount: number
  revenueEstimate: number
  ordersToday: number
  ordersThisWeek: number
  ordersThisMonth: number
}

interface InventorySummaryProps {
  stats: DashboardStats
}

interface StockLevel {
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  count: number
  percentage: number
  color: string
  bgColor: string
  icon: any
  label: string
}

export default function InventorySummary({ stats }: InventorySummaryProps) {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const calculateStockLevels = () => {
      const total = stats.totalProducts
      const inStock = total - stats.lowStockCount - stats.outOfStockCount
      
      const levels: StockLevel[] = [
        {
          status: 'in-stock',
          count: inStock,
          percentage: (inStock / total) * 100,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: CheckCircle,
          label: 'In Stock'
        },
        {
          status: 'low-stock',
          count: stats.lowStockCount,
          percentage: (stats.lowStockCount / total) * 100,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          icon: AlertTriangle,
          label: 'Low Stock'
        },
        {
          status: 'out-of-stock',
          count: stats.outOfStockCount,
          percentage: (stats.outOfStockCount / total) * 100,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: XCircle,
          label: 'Out of Stock'
        }
      ]
      
      setStockLevels(levels)
      setIsLoading(false)
    }

    calculateStockLevels()
  }, [stats])

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-5 bg-gray-200 rounded w-12 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
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
          <h2 className="text-xl font-bold text-gray-900 mb-1">Inventory Summary</h2>
          <p className="text-sm text-gray-500">Stock status across all products</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Package className="w-4 h-4" />
          <span>{stats.totalProducts.toLocaleString()} Total</span>
        </div>
      </div>

      {/* Stock Levels */}
      <div className="space-y-4">
        {stockLevels.map((level, index) => (
          <motion.div
            key={level.status}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${level.bgColor} rounded-lg flex items-center justify-center`}>
                <level.icon className={`w-5 h-5 ${level.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{level.label}</h3>
                <p className="text-sm text-gray-500">
                  {level.percentage.toFixed(1)}% of total inventory
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {level.count.toLocaleString()}
              </p>
              <div className="flex items-center justify-end space-x-1">
                {level.status === 'in-stock' && (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                )}
                {level.status === 'low-stock' && (
                  <TrendingDown className="w-4 h-4 text-yellow-600" />
                )}
                {level.status === 'out-of-stock' && (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${level.color}`}>
                  {level.status === 'in-stock' && 'Good'}
                  {level.status === 'low-stock' && 'Warning'}
                  {level.status === 'out-of-stock' && 'Critical'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Stock Distribution</span>
          <span className="text-xs text-gray-500">100%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="flex h-full">
            {stockLevels.map((level) => (
              <motion.div
                key={level.status}
                initial={{ width: 0 }}
                animate={{ width: `${level.percentage}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`
                  ${level.status === 'in-stock' ? 'bg-green-500' : ''}
                  ${level.status === 'low-stock' ? 'bg-yellow-500' : ''}
                  ${level.status === 'out-of-stock' ? 'bg-red-500' : ''}
                `}
                style={{ width: `${level.percentage}%` }}
              />
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 mt-3">
          {stockLevels.map((level) => (
            <div key={level.status} className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                level.status === 'in-stock' ? 'bg-green-500' :
                level.status === 'low-stock' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-gray-600">{level.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            View Low Stock
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Restock Items
          </motion.button>
        </div>
      </div>
    </div>
  )
}
