'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, TrendingUp, TrendingDown, Calendar, DollarSign, Package, ShoppingCart, Tag } from 'lucide-react'
import { useAdminAuth } from '@/hooks/use-auth'
import StatsCards from '@/components/admin/dashboard/stats-cards'
import SalesChart from '@/components/admin/dashboard/sales-chart'
import InventorySummary from '@/components/admin/dashboard/inventory-summary'
import RecentOrders from '@/components/admin/dashboard/recent-orders'
import TopProducts from '@/components/admin/dashboard/top-products'
import QuickActions from '@/components/admin/dashboard/quick-actions'
import ActivityFeed from '@/components/admin/dashboard/activity-feed'

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

export default function AdminDashboardPage() {
  const { user, loading } = useAdminAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // This would fetch real data from Supabase
      // For now, we'll use mock data that matches the expected structure
      const mockStats: DashboardStats = {
        totalProducts: 1247,
        totalCategories: 24,
        activePromotions: 8,
        pendingOrders: 15,
        totalStockValue: 2847500,
        lowStockCount: 23,
        outOfStockCount: 5,
        revenueEstimate: 45230,
        ordersToday: 34,
        ordersThisWeek: 156,
        ordersThisMonth: 623
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats(mockStats)
      setLastUpdated(new Date())
    } catch (err) {
      setError('Unable to load dashboard data')
      console.error('Dashboard data fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchDashboardData()
    }
  }, [loading, user])

  const handleRefresh = () => {
    fetchDashboardData()
  }

  // Loading skeleton
  if (loading || isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse h-80"></div>
          <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse h-80"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Unable to load dashboard data</h2>
          <p className="text-red-600 mb-6">There was an error loading your dashboard. Please try again.</p>
          <button
            onClick={handleRefresh}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Retry
          </button>
        </motion.div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'Admin'}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your supermarket today
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">
              {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <StatsCards stats={stats} />
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart - 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <SalesChart />
        </motion.div>

        {/* Inventory Summary - 1 column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InventorySummary stats={stats} />
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders - 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <RecentOrders />
        </motion.div>

        {/* Top Products - 1 column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TopProducts />
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - 1 column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <QuickActions />
        </motion.div>

        {/* Activity Feed - 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2"
        >
          <ActivityFeed />
        </motion.div>
      </div>
    </div>
  )
}
