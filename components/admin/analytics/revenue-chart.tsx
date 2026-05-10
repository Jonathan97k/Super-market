'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3 } from 'lucide-react'
import { useAnalytics } from '@/hooks/use-analytics'

interface RevenueChartProps {
  className?: string
  height?: number
  showArea?: boolean
  compact?: boolean
}

interface ChartDataPoint {
  date: string
  revenue: number
  orders: number
  growth: number
}

export default function RevenueChart({ 
  className = '', 
  height = 400,
  showArea = false,
  compact = false
}: RevenueChartProps) {
  const { data, loading, error, dateRange } = useAnalytics()
  const [chartType, setChartType] = useState<'revenue' | 'orders' | 'growth'>('revenue')
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  // Generate mock data based on the analytics data
  const chartData = useMemo(() => {
    if (!data) return []

    const generateDataPoints = (): ChartDataPoint[] => {
      const points: ChartDataPoint[] = []
      const days = timeframe === 'daily' ? 30 : timeframe === 'weekly' ? 12 : 24
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        const baseRevenue = data.totalSales / days
        const baseOrders = data.totalOrders / days
        
        const revenue = Math.max(0, baseRevenue + (Math.random() - 0.5) * baseRevenue * 0.3)
        const orders = Math.max(0, Math.floor(baseOrders + (Math.random() - 0.5) * baseOrders * 0.3))
        const growth = (Math.random() - 0.5) * 20

        points.push({
          date: date.toLocaleDateString('en-MW', { 
            month: 'short', 
            day: timeframe === 'daily' ? 'numeric' : undefined 
          }),
          revenue,
          orders,
          growth
        })
      }

      return points
    }

    return generateDataPoints()
  }, [data, timeframe])

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return { total: 0, average: 0, growth: 0, trend: 'up' }

    const values = chartData.map(d => d[chartType])
    const total = values.reduce((sum, val) => sum + val, 0)
    const average = total / values.length
    
    const firstValue = values[0]
    const lastValue = values[values.length - 1]
    const growth = ((lastValue - firstValue) / firstValue) * 100
    const trend = growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'

    return { total, average, growth, trend }
  }, [chartData, chartType])

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

  const formatValue = (value: number) => {
    switch (chartType) {
      case 'revenue':
        return formatCurrency(value)
      case 'orders':
        return formatNumber(value)
      case 'growth':
        return `${value.toFixed(1)}%`
      default:
        return formatNumber(value)
    }
  }

  const getChartColor = () => {
    switch (chartType) {
      case 'revenue':
        return '#10b981' // green
      case 'orders':
        return '#3b82f6' // blue
      case 'growth':
        return '#8b5cf6' // purple
      default:
        return '#10b981'
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 capitalize mr-4">{entry.name}:</span>
              <span className="font-medium text-gray-900">
                {entry.name === 'revenue' ? formatCurrency(entry.value) : 
                 entry.name === 'orders' ? formatNumber(entry.value) :
                 `${entry.value.toFixed(1)}%`}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Revenue Trend</h3>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
              ) : (
                formatValue(stats.average)
              )}
            </p>
          </div>
          
          <div className={`flex items-center ${stats.trend === 'up' ? 'text-green-600' : stats.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {stats.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : 
             stats.trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
            <span className="text-sm font-medium">
              {stats.growth > 0 ? '+' : ''}{stats.growth.toFixed(1)}%
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
          <p className="text-sm text-gray-600">Track your revenue trends over time</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: 'revenue', label: 'Revenue', icon: <DollarSign className="w-4 h-4" /> },
              { value: 'orders', label: 'Orders', icon: <BarChart3 className="w-4 h-4" /> },
              { value: 'growth', label: 'Growth', icon: <TrendingUp className="w-4 h-4" /> }
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

          {/* Timeframe Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' }
            ].map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeframe === tf.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total</span>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
            ) : (
              chartType === 'revenue' ? formatCurrency(stats.total) :
              chartType === 'orders' ? formatNumber(stats.total) :
              `${stats.growth.toFixed(1)}%`
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
            <span className="text-sm text-gray-600">Average</span>
            <BarChart3 className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
            ) : (
              formatValue(stats.average)
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
            <span className="text-sm text-gray-600">Growth</span>
            {stats.trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> :
             stats.trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-500" /> :
             <Calendar className="w-4 h-4 text-gray-400" />}
          </div>
          <p className={`text-xl font-bold ${
            stats.trend === 'up' ? 'text-green-600' :
            stats.trend === 'down' ? 'text-red-600' : 'text-gray-900'
          }`}>
            {loading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
            ) : (
              `${stats.growth > 0 ? '+' : ''}${stats.growth.toFixed(1)}%`
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
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Failed to load revenue data</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {showArea ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={getChartColor()} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => chartType === 'revenue' ? `MWK${(value / 1000).toFixed(0)}k` : formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={chartType}
                  stroke={getChartColor()}
                  strokeWidth={2}
                  fill="url(#colorChart)"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => chartType === 'revenue' ? `MWK${(value / 1000).toFixed(0)}k` : formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={chartType}
                  stroke={getChartColor()}
                  strokeWidth={3}
                  dot={{ fill: getChartColor(), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Showing {timeframe} data for {dateRange.label}</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Mini version for dashboard widgets
 */
export function RevenueChartMini({ className = '' }: { className?: string }) {
  const { data, loading } = useAnalytics()

  // Generate mini chart data
  const miniData = useMemo(() => {
    if (!data) return []
    
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      revenue: Math.max(0, (data.totalSales / 7) + (Math.random() - 0.5) * (data.totalSales / 7) * 0.3)
    }))
  }, [data])

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Weekly Revenue</h4>
        {loading ? (
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
        ) : (
          <span className="text-xs text-green-600 font-medium">+12.5%</span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={miniData}>
          <XAxis dataKey="day" hide />
          <YAxis hide />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
