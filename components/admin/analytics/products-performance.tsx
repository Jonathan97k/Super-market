'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Eye, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical
} from 'lucide-react'
import { useAnalytics } from '@/hooks/use-analytics'

interface ProductsPerformanceProps {
  className?: string
  maxItems?: number
  showFilters?: boolean
  compact?: boolean
}

interface ProductPerformance {
  productId: string
  productName: string
  productImage?: string
  views: number
  orders: number
  revenue: number
  quantity: number
  stock: number
  category: string
  conversionRate: number
  averageOrderValue: number
  trend: 'up' | 'down' | 'stable'
}

export default function ProductsPerformance({ 
  className = '', 
  maxItems = 10,
  showFilters = true,
  compact = false
}: ProductsPerformanceProps) {
  const { data, loading, error } = useAnalytics()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'revenue' | 'orders' | 'views' | 'conversion'>('revenue')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState('all')

  // Process and enhance product data
  const productsData = useMemo(() => {
    if (!data?.topProducts) return []

    return data.topProducts.slice(0, maxItems).map(product => ({
      ...product,
      conversionRate: product.views > 0 ? (product.orders / product.views) * 100 : 0,
      averageOrderValue: product.orders > 0 ? product.revenue / product.orders : 0,
      trend: (Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable') as 'up' | 'down' | 'stable'
    }))
  }, [data, maxItems])

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = productsData

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory)
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: number, bValue: number

      switch (sortBy) {
        case 'revenue':
          aValue = a.revenue
          bValue = b.revenue
          break
        case 'orders':
          aValue = a.orders
          bValue = b.orders
          break
        case 'views':
          aValue = a.views
          bValue = b.views
          break
        case 'conversion':
          aValue = a.conversionRate
          bValue = b.conversionRate
          break
        default:
          aValue = a.revenue
          bValue = b.revenue
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [productsData, searchTerm, filterCategory, sortBy, sortDirection])

  // Get unique categories
  const categories = useMemo(() => {
    if (!productsData) return []
    const uniqueCategories = [...new Set(productsData.map(p => p.category))]
    return uniqueCategories
  }, [productsData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-MW').format(Math.round(value))
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Stock' }
    if (stock < 10) return { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Low Stock' }
    if (stock < 50) return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Limited' }
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock' }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />
    }
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Top Products</h3>
          <Package className="w-4 h-4 text-gray-400" />
        </div>

        <div className="space-y-3">
          {filteredAndSortedProducts.slice(0, 5).map((product, index) => (
            <motion.div
              key={product.productId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                {product.productImage ? (
                  <img
                    src={product.productImage}
                    alt={product.productName}
                    className="w-8 h-8 rounded object-cover mr-3"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {product.productName}
                  </p>
                  <p className="text-xs text-gray-500">{formatNumber(product.orders)} orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(product.revenue)}
                </p>
                {getTrendIcon(product.trend)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Products Performance</h3>
            <p className="text-sm text-gray-600">Top performing products analysis</p>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort */}
            <button
              onClick={() => handleSort(sortBy)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Sort by {sortBy}
              <span className="ml-1 text-xs text-gray-500">
                ({sortDirection === 'asc' ? '↑' : '↓'})
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('views')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Views
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('orders')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Orders
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('revenue')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Revenue
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('conversion')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Conversion
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 5 }, (_, index) => (
                <tr key={index}>
                  <td colSpan={9}>
                    <div className="p-4">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : filteredAndSortedProducts.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No products found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedProducts.map((product, index) => {
                const stockStatus = getStockStatus(product.stock)
                
                return (
                  <motion.tr
                    key={product.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.productImage ? (
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {product.productName}
                          </p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatNumber(product.views)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShoppingCart className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatNumber(product.orders)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.revenue)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">
                          {product.conversionRate.toFixed(1)}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(product.conversionRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTrendIcon(product.trend)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {filteredAndSortedProducts.length} of {productsData.length} products
          </span>
          <div className="flex items-center space-x-4">
            <span>Total Revenue: {formatCurrency(filteredAndSortedProducts.reduce((sum, p) => sum + p.revenue, 0))}</span>
            <span>Total Orders: {formatNumber(filteredAndSortedProducts.reduce((sum, p) => sum + p.orders, 0))}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Mini version for dashboard widgets
 */
export function ProductsPerformanceMini({ className = '' }: { className?: string }) {
  const { data, loading } = useAnalytics()

  const topProducts = useMemo(() => {
    if (!data?.topProducts) return []
    return data.topProducts.slice(0, 3)
  }, [data])

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">Top Products</h4>
        <Package className="w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-3">
        {topProducts.map((product, index) => (
          <motion.div
            key={product.productId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              {product.productImage ? (
                <img
                  src={product.productImage}
                  alt={product.productName}
                  className="w-8 h-8 rounded object-cover mr-3"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                  {product.productName}
                </p>
                <p className="text-xs text-gray-500">{product.orders} orders</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">
                {loading ? (
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                ) : (
                  new Intl.NumberFormat('en-MW', {
                    style: 'currency',
                    currency: 'MWK',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(product.revenue)
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
