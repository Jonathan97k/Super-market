'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { ShoppingCart, Package, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { useAnalytics } from '@/hooks/use-analytics'

interface OrdersChartProps {
  className?: string
  height?: number
  chartType?: 'status' | 'timeline' | 'daily'
  compact?: boolean
}

const STATUS_COLORS = {
  pending: '#f59e0b',
  completed: '#10b981',
  cancelled: '#ef4444',
  refunded: '#6366f1'
}

const STATUS_LABELS = {
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded'
}

export default function OrdersChart({ 
  className = '', 
  height = 400,
  chartType = 'status',
  compact = false
}: OrdersChartProps) {
  const { data, loading, error } = useAnalytics()

  // Generate mock data based on analytics
  const statusData = useMemo(() => {
    if (!data) return []

    const { pending, completed, cancelled, refunded } = data.orderStatusBreakdown

    return [
      { name: 'Pending', value: pending, percentage: (pending / data.totalOrders) * 100 },
      { name: 'Completed', value: completed, percentage: (completed / data.totalOrders) * 100 },
      { name: 'Cancelled', value: cancelled, percentage: (cancelled / data.totalOrders) * 100 },
      { name: 'Refunded', value: refunded, percentage: (refunded / data.totalOrders) * 100 }
    ].filter(item => item.value > 0)
  }, [data])

  const timelineData = useMemo(() => {
    if (!data) return []

    // Generate hourly data for the last 24 hours
    return Array.from({ length: 24 }, (_, i) => {
      const hour = new Date()
      hour.setHours(hour.getHours() - (23 - i))
      
      const baseOrders = data.totalOrders / 24
      const orders = Math.max(0, Math.floor(baseOrders + (Math.random() - 0.5) * baseOrders * 0.5))
      
      return {
        hour: hour.getHours(),
        time: hour.toLocaleTimeString('en-MW', { hour: '2-digit', minute: '2-digit' }),
        orders,
        completed: Math.floor(orders * 0.7),
        pending: Math.floor(orders * 0.2),
        cancelled: Math.floor(orders * 0.1)
      }
    })
  }, [data])

  const dailyData = useMemo(() => {
    if (!data) return []

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      
      const baseOrders = data.totalOrders / 7
      const orders = Math.max(0, Math.floor(baseOrders + (Math.random() - 0.5) * baseOrders * 0.3))
      
      return {
        date: date.toLocaleDateString('en-MW', { weekday: 'short', month: 'short', day: 'numeric' }),
        orders,
        revenue: orders * (data.averageOrderValue + (Math.random() - 0.5) * 100)
      }
    })
  }, [data])

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
                {entry.name === 'revenue' ? 
                  new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK' }).format(entry.value) :
                  new Intl.NumberFormat('en-MW').format(entry.value)
                }
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
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-1">{data.name}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Orders:</span>
            <span className="font-medium text-gray-900 ml-4">
              {new Intl.NumberFormat('en-MW').format(data.value)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-600">Percentage:</span>
            <span className="font-medium text-gray-900 ml-4">
              {data.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  const renderStatusChart = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Order Status Distribution</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase() as keyof typeof STATUS_COLORS]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Status Cards */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Order Details</h4>
        <div className="space-y-3">
          {statusData.map((status, index) => (
            <motion.div
              key={status.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: STATUS_COLORS[status.name.toLowerCase() as keyof typeof STATUS_COLORS] }}
                />
                <span className="text-sm font-medium text-gray-900">{status.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {new Intl.NumberFormat('en-MW').format(status.value)}
                </p>
                <p className="text-xs text-gray-500">{status.percentage.toFixed(1)}%</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTimelineChart = () => (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-4">Orders Timeline (Last 24 Hours)</h4>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={timelineData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10 }}
            interval={3}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  const renderDailyChart = () => (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-4">Daily Orders & Revenue</h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  if (compact) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Order Status</h3>
          <ShoppingCart className="w-4 h-4 text-gray-400" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {statusData.slice(0, 4).map((status, index) => (
            <motion.div
              key={status.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div 
                className="w-2 h-2 rounded-full mx-auto mb-2" 
                style={{ backgroundColor: STATUS_COLORS[status.name.toLowerCase() as keyof typeof STATUS_COLORS] }}
              />
              <p className="text-xs text-gray-600">{status.name}</p>
              <p className="text-lg font-bold text-gray-900">
                {loading ? (
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-8 mx-auto" />
                ) : (
                  new Intl.NumberFormat('en-MW').format(status.value)
                )}
              </p>
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
          <h3 className="text-lg font-semibold text-gray-900">Order Analytics</h3>
          <p className="text-sm text-gray-600">Monitor order status and trends</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: 'status', label: 'Status', icon: <Package className="w-4 h-4" /> },
              { value: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
              { value: 'daily', label: 'Daily', icon: <TrendingUp className="w-4 h-4" /> }
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

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statusData.map((status, index) => (
          <motion.div
            key={status.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4 text-center"
          >
            <div className="flex justify-center mb-2">
              {status.name === 'Pending' && <Clock className="w-5 h-5 text-amber-500" />}
              {status.name === 'Completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {status.name === 'Cancelled' && <XCircle className="w-5 h-5 text-red-500" />}
              {status.name === 'Refunded' && <AlertCircle className="w-5 h-5 text-blue-500" />}
            </div>
            <p className="text-xs text-gray-600 mb-1">{status.name}</p>
            <p className="text-xl font-bold text-gray-900">
              {loading ? (
                <div className="h-6 bg-gray-200 rounded animate-pulse w-12 mx-auto" />
              ) : (
                new Intl.NumberFormat('en-MW').format(status.value)
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">{status.percentage.toFixed(1)}%</p>
          </motion.div>
        ))}
      </div>

      {/* Chart Content */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error ? (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Failed to load order data</p>
            </div>
          </div>
        ) : (
          <>
            {chartType === 'status' && renderStatusChart()}
            {chartType === 'timeline' && renderTimelineChart()}
            {chartType === 'daily' && renderDailyChart()}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total Orders: {data ? new Intl.NumberFormat('en-MW').format(data.totalOrders) : 'Loading...'}</span>
          <span>Completion Rate: {data ? ((data.orderStatusBreakdown.completed / data.totalOrders) * 100).toFixed(1) : '0'}%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Mini version for dashboard widgets
 */
export function OrdersChartMini({ className = '' }: { className?: string }) {
  const { data, loading } = useAnalytics()

  const miniStatusData = useMemo(() => {
    if (!data) return []

    const { pending, completed, cancelled, refunded } = data.orderStatusBreakdown

    return [
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Cancelled', value: cancelled, color: '#ef4444' },
      { name: 'Refunded', value: refunded, color: '#6366f1' }
    ].filter(item => item.value > 0)
  }, [data])

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Order Status</h4>
        <ShoppingCart className="w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-2">
        {miniStatusData.slice(0, 3).map((status, index) => (
          <div key={status.name} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-2 h-2 rounded-full mr-2" 
                style={{ backgroundColor: status.color }}
              />
              <span className="text-xs text-gray-600">{status.name}</span>
            </div>
            <span className="text-xs font-medium text-gray-900">
              {loading ? (
                <div className="h-3 bg-gray-200 rounded animate-pulse w-8" />
              ) : (
                new Intl.NumberFormat('en-MW').format(status.value)
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
