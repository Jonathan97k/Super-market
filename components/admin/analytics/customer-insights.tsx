'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  ShoppingCart,
  Calendar,
  Repeat,
  UserPlus,
  UserCheck,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { useAnalytics } from '@/hooks/use-analytics'

interface CustomerInsightsProps {
  className?: string
  height?: number
  chartType?: 'retention' | 'aov' | 'timing' | 'segmentation'
  compact?: boolean
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

export default function CustomerInsights({ 
  className = '', 
  height = 400,
  chartType = 'retention',
  compact = false
}: CustomerInsightsProps) {
  const { data, loading, error } = useAnalytics()

  // Process customer data
  const customerMetrics = useMemo(() => {
    if (!data?.customerMetrics) return null

    return {
      ...data.customerMetrics,
      // Add calculated metrics
      customerRetentionRate: data.customerMetrics.repeatPurchaseRate * 100,
      customerAcquisitionRate: (data.customerMetrics.newCustomers / data.customerMetrics.totalCustomers) * 100,
      averageOrdersPerCustomer: data.totalOrders / data.customerMetrics.totalCustomers,
      customerLifetimeValue: data.customerMetrics.averageOrderValue * 3.5 // Mock LTV calculation
    }
  }, [data])

  // Generate retention data
  const retentionData = useMemo(() => {
    if (!customerMetrics) return []

    return [
      { month: 'Jan', newCustomers: 120, returningCustomers: 80, retentionRate: 66.7 },
      { month: 'Feb', newCustomers: 150, returningCustomers: 95, retentionRate: 63.3 },
      { month: 'Mar', newCustomers: 180, returningCustomers: 120, retentionRate: 66.7 },
      { month: 'Apr', newCustomers: 200, returningCustomers: 140, retentionRate: 70.0 },
      { month: 'May', newCustomers: 220, returningCustomers: 160, retentionRate: 72.7 },
      { month: 'Jun', newCustomers: 250, returningCustomers: 180, retentionRate: 72.0 }
    ]
  }, [customerMetrics])

  // Generate AOV data
  const aovData = useMemo(() => {
    if (!customerMetrics) return []

    return [
      { segment: 'New', aov: customerMetrics.averageOrderValue * 0.8, customers: customerMetrics.newCustomers },
      { segment: 'Returning', aov: customerMetrics.averageOrderValue * 1.2, customers: customerMetrics.returningCustomers },
      { segment: 'VIP', aov: customerMetrics.averageOrderValue * 1.5, customers: Math.floor(customerMetrics.totalCustomers * 0.1) },
      { segment: 'Inactive', aov: customerMetrics.averageOrderValue * 0.6, customers: Math.floor(customerMetrics.totalCustomers * 0.05) }
    ]
  }, [customerMetrics])

  // Generate shopping timing data
  const timingData = useMemo(() => {
    if (!customerMetrics?.popularShoppingTimes) return []

    // Aggregate by hour
    const hourlyData = new Map<number, { orders: number; revenue: number }>()
    
    customerMetrics.popularShoppingTimes.forEach(time => {
      const existing = hourlyData.get(time.hour) || { orders: 0, revenue: 0 }
      hourlyData.set(time.hour, {
        orders: existing.orders + time.orders,
        revenue: existing.revenue + time.revenue
      })
    })

    return Array.from(hourlyData.entries())
      .map(([hour, data]) => ({
        hour,
        time: `${hour}:00`,
        orders: data.orders,
        revenue: data.revenue
      }))
      .sort((a, b) => a.hour - b.hour)
  }, [customerMetrics])

  // Generate segmentation data
  const segmentationData = useMemo(() => {
    if (!customerMetrics) return []

    return [
      { name: 'New Customers', value: customerMetrics.newCustomers, percentage: (customerMetrics.newCustomers / customerMetrics.totalCustomers) * 100 },
      { name: 'Returning', value: customerMetrics.returningCustomers, percentage: (customerMetrics.returningCustomers / customerMetrics.totalCustomers) * 100 },
      { name: 'VIP', value: Math.floor(customerMetrics.totalCustomers * 0.1), percentage: 10 },
      { name: 'Inactive', value: Math.floor(customerMetrics.totalCustomers * 0.05), percentage: 5 }
    ]
  }, [customerMetrics])

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
                {entry.name === 'aov' || entry.name === 'revenue' ? formatCurrency(entry.value) :
                 entry.name === 'retentionRate' || entry.name === 'percentage' ? `${entry.value.toFixed(1)}%` :
                 formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const renderRetentionChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={retentionData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="newCustomers" stroke="#3b82f6" strokeWidth={2} />
        <Line type="monotone" dataKey="returningCustomers" stroke="#10b981" strokeWidth={2} />
        <Line type="monotone" dataKey="retentionRate" stroke="#8b5cf6" strokeWidth={2} yAxisId="right" />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderAOVChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={aovData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="segment" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="aov" fill="#10b981" radius={[8, 8, 0, 0]} />
        <Bar dataKey="customers" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderTimingChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={timingData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="orders" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
        <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  )

  const renderSegmentationChart = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={segmentationData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {segmentationData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-4">
        {segmentationData.map((segment, index) => (
          <motion.div
            key={segment.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-3" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium text-gray-900">{segment.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{formatNumber(segment.value)}</p>
              <p className="text-xs text-gray-500">{segment.percentage.toFixed(1)}%</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  if (compact) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Customer Insights</h3>
          <Users className="w-4 h-4 text-gray-400" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Total Customers</p>
            <p className="text-lg font-bold text-gray-900">
              {loading ? (
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16 mx-auto" />
              ) : (
                formatNumber(customerMetrics?.totalCustomers || 0)
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Retention Rate</p>
            <p className="text-lg font-bold text-gray-900">
              {loading ? (
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16 mx-auto" />
              ) : (
                `${customerMetrics?.customerRetentionRate?.toFixed(1) || 0}%`
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Insights</h3>
          <p className="text-sm text-gray-600">Customer behavior and retention analysis</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: 'retention', label: 'Retention', icon: <Repeat className="w-4 h-4" /> },
              { value: 'aov', label: 'AOV', icon: <DollarSign className="w-4 h-4" /> },
              { value: 'timing', label: 'Timing', icon: <Clock className="w-4 h-4" /> },
              { value: 'segmentation', label: 'Segments', icon: <PieChartIcon className="w-4 h-4" /> }
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
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Customers</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
            ) : (
              formatNumber(customerMetrics?.totalCustomers || 0)
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
            <span className="text-sm text-gray-600">New Customers</span>
            <UserPlus className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
            ) : (
              formatNumber(customerMetrics?.newCustomers || 0)
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
            <span className="text-sm text-gray-600">Retention Rate</span>
            <UserCheck className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
            ) : (
              `${customerMetrics?.customerRetentionRate?.toFixed(1) || 0}%`
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Order Value</span>
            <ShoppingCart className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
            ) : (
              formatCurrency(customerMetrics?.averageOrderValue || 0)
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
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Failed to load customer data</p>
            </div>
          </div>
        ) : (
          <>
            {chartType === 'retention' && renderRetentionChart()}
            {chartType === 'aov' && renderAOVChart()}
            {chartType === 'timing' && renderTimingChart()}
            {chartType === 'segmentation' && renderSegmentationChart()}
          </>
        )}
      </div>

      {/* Additional Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Key Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center p-3 bg-blue-50 rounded-lg"
          >
            <Activity className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Peak Shopping Time</p>
              <p className="text-xs text-gray-600">2:00 PM - 6:00 PM</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center p-3 bg-green-50 rounded-lg"
          >
            <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Customer Growth</p>
              <p className="text-xs text-gray-600">+15.3% this month</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center p-3 bg-purple-50 rounded-lg"
          >
            <Repeat className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Repeat Purchase Rate</p>
              <p className="text-xs text-gray-600">{customerMetrics?.repeatPurchaseRate ? `${(customerMetrics.repeatPurchaseRate * 100).toFixed(1)}%` : '0%'}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/**
 * Mini version for dashboard widgets
 */
export function CustomerInsightsMini({ className = '' }: { className?: string }) {
  const { data, loading } = useAnalytics()

  const customerMetrics = useMemo(() => {
    if (!data?.customerMetrics) return null
    return data.customerMetrics
  }, [data])

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">Customer Metrics</h4>
        <Users className="w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Total Customers</span>
          <span className="text-sm font-bold text-gray-900">
            {loading ? (
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            ) : (
              new Intl.NumberFormat('en-MW').format(customerMetrics?.totalCustomers || 0)
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">New Customers</span>
          <span className="text-sm font-bold text-gray-900">
            {loading ? (
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            ) : (
              new Intl.NumberFormat('en-MW').format(customerMetrics?.newCustomers || 0)
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Retention Rate</span>
          <span className="text-sm font-bold text-gray-900">
            {loading ? (
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            ) : (
              `${((customerMetrics?.repeatPurchaseRate || 0) * 100).toFixed(1)}%`
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
