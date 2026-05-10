'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react'
import SalesOverviewCards from '@/components/admin/analytics/sales-overview-cards'
import RevenueChart from '@/components/admin/analytics/revenue-chart'
import OrdersChart from '@/components/admin/analytics/orders-chart'
import ProductsPerformance from '@/components/admin/analytics/products-performance'
import TopCategories from '@/components/admin/analytics/top-categories'
import CustomerInsights from '@/components/admin/analytics/customer-insights'
import LowStockAlerts from '@/components/admin/analytics/low-stock-alerts'
import DateRangeFilter from '@/components/admin/analytics/date-range-filter'
import AnalyticsExport from '@/components/admin/analytics/analytics-export'
import RealtimeActivity from '@/components/admin/analytics/realtime-activity'
import { useAnalytics } from '@/hooks/use-analytics'

export default function AdminAnalyticsPage() {
  const { loading, error, refresh, dateRange } = useAnalytics()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">Comprehensive business intelligence and insights</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DateRangeFilter 
                showRefresh={true}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="w-5 h-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Analytics Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="ml-auto flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Sales Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SalesOverviewCards />
        </motion.div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RevenueChart height={400} />
          </motion.div>

          {/* Orders Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <OrdersChart height={400} />
          </motion.div>
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Top Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TopCategories height={350} />
          </motion.div>

          {/* Customer Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CustomerInsights height={350} />
          </motion.div>

          {/* Low Stock Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <LowStockAlerts compact={true} />
          </motion.div>
        </div>

        {/* Products Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <ProductsPerformance maxItems={15} />
        </motion.div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Realtime Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <RealtimeActivity maxItems={10} />
          </motion.div>

          {/* Export Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <AnalyticsExport compact={true} />
          </motion.div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-8 max-w-sm mx-4">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Analytics</h3>
                <p className="text-sm text-gray-600 text-center">
                  Gathering comprehensive business intelligence data...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
