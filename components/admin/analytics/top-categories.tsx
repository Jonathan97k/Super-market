'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  TreemapChart,
  Treemap
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  ShoppingBag,
  ArrowUpDown,
  Grid3X3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { useAnalytics } from '@/hooks/use-analytics'

interface TopCategoriesProps {
  className?: string
  height?: number
  chartType?: 'bar' | 'pie' | 'treemap'
  maxCategories?: number
  compact?: boolean
}

const COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6366f1'  // indigo
]

export default function TopCategories({ 
  className = '', 
  height = 400,
  chartType = 'bar',
  maxCategories = 10,
  compact = false
}: TopCategoriesProps) {
  const { data, loading, error } = useAnalytics()
  const [sortBy, setSortBy] = useState<'revenue' | 'orders' | 'growth'>('revenue')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Process category data
  const categoriesData = useMemo(() => {
    if (!data?.salesByCategory) return []

    return data.salesByCategory
      .slice(0, maxCategories)
      .map((category, index) => ({
        ...category,
        color: COLORS[index % COLORS.length],
        averageOrderValue: category.orders > 0 ? category.revenue / category.orders : 0,
        growth: category.growth || (Math.random() - 0.5) * 20 // Mock growth percentage
      }))
  }, [data, maxCategories])

  // Sort categories
  const sortedCategories = useMemo(() => {
    return [...categoriesData].sort((a, b) => {
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
        case 'growth':
          aValue = a.growth
          bValue = b.growth
          break
        default:
          aValue = a.revenue
          bValue = b.revenue
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    })
  }, [categoriesData, sortBy, sortDirection])

  // Calculate totals
  const totals = useMemo(() => {
    return sortedCategories.reduce(
      (acc, cat) => ({
        revenue: acc.revenue + cat.revenue,
        orders: acc.orders + cat.orders,
        quantity: acc.quantity + cat.quantity
      }),
      { revenue: 0, orders: 0, quantity: 0 }
    )
  }, [sortedCategories])

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

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <div className="w-4 h-4 bg-gray-300 rounded-full" />
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-gray-600 capitalize">{entry.name}:</span>
              </div>
              <span className="font-medium text-gray-900 ml-4">
                {entry.name === 'revenue' ? formatCurrency(entry.value) :
                 entry.name === 'averageOrderValue' ? formatCurrency(entry.value) :
                 entry.name === 'growth' ? `${entry.value.toFixed(1)}%` :
                 formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / totals.revenue) * 100).toFixed(1)
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-1">{data.name}</p>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Revenue:</span>
            <span className="font-medium text-gray-900 ml-4">
              {formatCurrency(data.value)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Orders:</span>
            <span className="font-medium text-gray-900 ml-4">
              {formatNumber(data.payload.orders)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Share:</span>
            <span className="font-medium text-gray-900 ml-4">{percentage}%</span>
          </div>
        </div>
      )
    }
    return null
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sortedCategories}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="category" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
        <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={sortedCategories}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="revenue"
        >
          {sortedCategories.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )

  const renderTreemap = () => (
    <ResponsiveContainer width="100%" height={height}>
      <TreemapChart
        data={[{
          name: 'Categories',
          children: sortedCategories.map(cat => ({
            name: cat.category,
            size: cat.revenue,
            revenue: cat.revenue,
            orders: cat.orders,
            growth: cat.growth
          }))
        }]}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="#fff"
        fill="#8884d8"
        content={({ x, y, width, height, name, value, revenue, orders, growth }: any) => (
          <g>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              style={{
                fill: COLORS[sortedCategories.findIndex(c => c.category === name) % COLORS.length],
                stroke: '#fff',
                strokeWidth: 2
              }}
            />
            {width > 50 && height > 30 && (
              <>
                <text
                  x={x + width / 2}
                  y={y + height / 2 - 10}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={12}
                  fontWeight="bold"
                >
                  {name}
                </text>
                <text
                  x={x + width / 2}
                  y={y + height / 2 + 5}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={10}
                >
                  {formatCurrency(revenue)}
                </text>
              </>
            )}
          </g>
        )}
      >
        <Tooltip content={<CustomTooltip />} />
      </TreemapChart>
    </ResponsiveContainer>
  )

  if (compact) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Top Categories</h3>
          <ShoppingBag className="w-4 h-4 text-gray-400" />
        </div>

        <div className="space-y-3">
          {sortedCategories.slice(0, 5).map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{category.category}</p>
                  <p className="text-xs text-gray-500">{formatNumber(category.orders)} orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(category.revenue)}
                </p>
                {getGrowthIcon(category.growth)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
          <p className="text-sm text-gray-600">Top performing categories analysis</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: 'bar', label: 'Bar', icon: <BarChart className="w-4 h-4" /> },
              { value: 'pie', label: 'Pie', icon: <PieChartIcon className="w-4 h-4" /> },
              { value: 'treemap', label: 'Tree', icon: <Grid3X3 className="w-4 h-4" /> }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value as any)}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  chartType === type.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type.icon}
                <span className="ml-1">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Sort by:</span>
            {[
              { value: 'revenue', label: 'Revenue' },
              { value: 'orders', label: 'Orders' },
              { value: 'growth', label: 'Growth' }
            ].map((sort) => (
              <button
                key={sort.value}
                onClick={() => handleSort(sort.value as any)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  sortBy === sort.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {sort.label}
                {sortBy === sort.value && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
            ) : (
              formatCurrency(totals.revenue)
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Orders</span>
            <Package className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
            ) : (
              formatNumber(totals.orders)
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Categories</span>
            <ShoppingBag className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
            ) : (
              sortedCategories.length
            )}
          </p>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error ? (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Failed to load category data</p>
            </div>
          </div>
        ) : (
          <>
            {chartType === 'bar' && renderBarChart()}
            {chartType === 'pie' && renderPieChart()}
            {chartType === 'treemap' && renderTreemap()}
          </>
        )}
      </div>

      {/* Category List */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Category Breakdown</h4>
        <div className="space-y-3">
          {sortedCategories.slice(0, 5).map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{category.category}</p>
                  <p className="text-xs text-gray-500">
                    {formatNumber(category.orders)} orders • {formatNumber(category.quantity)} items
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(category.revenue)}
                </p>
                <div className="flex items-center justify-end mt-1">
                  {getGrowthIcon(category.growth)}
                  <span className={`ml-1 text-xs ${
                    category.growth > 0 ? 'text-green-600' : 
                    category.growth < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {category.growth > 0 ? '+' : ''}{category.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Mini version for dashboard widgets
 */
export function TopCategoriesMini({ className = '' }: { className?: string }) {
  const { data, loading } = useAnalytics()

  const topCategories = useMemo(() => {
    if (!data?.salesByCategory) return []
    return data.salesByCategory.slice(0, 3)
  }, [data])

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">Top Categories</h4>
        <ShoppingBag className="w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-3">
        {topCategories.map((category, index) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <div 
                className="w-2 h-2 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-900">{category.category}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {loading ? (
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
              ) : (
                new Intl.NumberFormat('en-MW', {
                  style: 'currency',
                  currency: 'MWK',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(category.revenue)
              )}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
