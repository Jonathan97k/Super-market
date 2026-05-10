'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Calendar, TrendingUp, Clock, CheckCircle, XCircle, Pause } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PromotionService, PromotionType, PromotionStatus } from '@/services/promotions'
import { Promotion } from '@/types/promotion'
import PromotionsTable from '@/components/admin/promotions/promotions-table'

export default function AdminPromotionsPage() {
  const router = useRouter()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<{
    type?: PromotionType
    status?: PromotionStatus
  }>({})
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0
  })

  // Load promotions
  useEffect(() => {
    loadPromotions()
  }, [filters])

  const loadPromotions = async () => {
    try {
      setLoading(true)
      const { promotions: data } = await PromotionService.getPromotions(filters)
      setPromotions(data)

      // Calculate stats
      const stats = data.reduce((acc, promo) => {
        const status = PromotionService.getPromotionStatus(promo)
        acc.total++
        if (status === 'live') acc.active++
        else if (status === 'scheduled') acc.scheduled++
        else if (status === 'expired') acc.expired++
        return acc
      }, { total: 0, active: 0, scheduled: 0, expired: 0 })

      setStats(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promotions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePromotion = () => {
    router.push('/admin/promotions/new')
  }

  const handleEditPromotion = (id: string) => {
    router.push(`/admin/promotions/edit/${id}`)
  }

  const handleDeletePromotion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return

    try {
      await PromotionService.deletePromotion(id)
      await loadPromotions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete promotion')
    }
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await PromotionService.togglePromotionStatus(id, isActive)
      await loadPromotions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update promotion status')
    }
  }

  const handleDuplicatePromotion = async (id: string) => {
    try {
      await PromotionService.duplicatePromotion(id)
      await loadPromotions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate promotion')
    }
  }

  const getStatusColor = (status: PromotionStatus) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-700 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'expired': return 'bg-red-100 text-red-700 border-red-200'
      case 'paused': return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: PromotionStatus) => {
    switch (status) {
      case 'live': return <CheckCircle className="w-4 h-4" />
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'expired': return <XCircle className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Promotions Management</h1>
              <p className="text-lg text-gray-600">Create and manage marketing campaigns</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreatePromotion}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Promotion
            </motion.button>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Promotions</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Active</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Scheduled</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.scheduled}</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Expired</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h3>
            
            {(filters.type || filters.status) && (
              <button
                onClick={() => setFilters({})}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  type: e.target.value as PromotionType || undefined
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="hero_banner">Hero Banner</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="category_offer">Category Offer</option>
                <option value="product_discount">Product Discount</option>
                <option value="countdown_offer">Countdown Offer</option>
                <option value="announcement_strip">Announcement Strip</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: e.target.value as PromotionStatus || undefined
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="live">Live</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Promotions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PromotionsTable
            promotions={promotions}
            onEdit={handleEditPromotion}
            onDelete={handleDeletePromotion}
            onToggleStatus={handleToggleStatus}
            onDuplicate={handleDuplicatePromotion}
            onRefresh={loadPromotions}
          />
        </motion.div>
      </div>
    </div>
  )
}
