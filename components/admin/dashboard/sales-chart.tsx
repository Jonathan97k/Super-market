'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar, DollarSign, BarChart3 } from 'lucide-react'

interface SalesData {
  date: string
  revenue: number
  orders: number
}

interface ChartPeriod {
  label: string
  value: '7d' | '30d' | '90d'
}

export default function SalesChart() {
  const [period, setPeriod] = useState<ChartPeriod['value']>('7d')
  const [data, setData] = useState<SalesData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const periods: ChartPeriod[] = [
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' }
  ]

  // Generate mock sales data
  const generateSalesData = (days: number): SalesData[] => {
    const data: SalesData[] = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const baseRevenue = 35000 + Math.random() * 15000
      const baseOrders = 25 + Math.random() * 20
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(baseRevenue),
        orders: Math.round(baseOrders)
      })
    }
    
    return data
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      setData(generateSalesData(days))
      setIsLoading(false)
    }

    loadData()
  }, [period])

  // Calculate chart dimensions and points
  const getChartPoints = () => {
    if (data.length === 0) return []
    
    const maxRevenue = Math.max(...data.map(d => d.revenue))
    const minRevenue = Math.min(...data.map(d => d.revenue))
    const range = maxRevenue - minRevenue || 1
    
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((point.revenue - minRevenue) / range) * 100
      return { x, y, value: point.revenue, date: point.date }
    })
  }

  const chartPoints = getChartPoints()
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0
  const avgOrders = data.length > 0 ? totalOrders / data.length : 0

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
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
          <h2 className="text-xl font-bold text-gray-900 mb-1">Sales Analytics</h2>
          <p className="text-sm text-gray-500">Revenue and order trends over time</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === p.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 mb-6">
        <svg width="100%" height="100%" viewBox="0 0 400 256" className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y * 2.56}
              x2="400"
              y2={y * 2.56}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Revenue line */}
          <motion.polyline
            points={chartPoints.map(p => `${p.x * 4},${p.y * 2.56}`).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          
          {/* Area fill */}
          <motion.polygon
            points={`${chartPoints.map(p => `${p.x * 4},${p.y * 2.56}`).join(' ')} 400,256 0,256`}
            fill="url(#gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Data points */}
          {chartPoints.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x * 4}
              cy={point.y * 2.56}
              r="4"
              fill="#10b981"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="cursor-pointer hover:r-6"
            />
          ))}
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-lg mx-auto mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            MK {avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500">Avg. Daily Revenue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg mx-auto mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {avgOrders.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </p>
          <p className="text-xs text-gray-500">Avg. Daily Orders</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-purple-50 rounded-lg mx-auto mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            MK {totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Total Revenue</p>
        </motion.div>
      </div>
    </div>
  )
}
