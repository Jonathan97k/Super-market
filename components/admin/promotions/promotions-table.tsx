'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  ArrowUpDown
} from 'lucide-react'
import { PromotionService, PromotionType, PromotionStatus } from '@/services/promotions'
import { Promotion } from '@/types/promotion'
import PromotionStatusToggle from './promotion-status-toggle'
import PromotionActions from './promotion-actions'

interface PromotionsTableProps {
  promotions: Promotion[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  onDuplicate: (id: string) => void
  onRefresh: () => void
}

export default function PromotionsTable({
  promotions,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  onRefresh
}: PromotionsTableProps) {
  const [sortField, setSortField] = useState<'priority' | 'startDate' | 'endDate' | 'createdAt'>('priority')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Sort promotions
  const sortedPromotions = [...promotions].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortField) {
      case 'priority':
        aValue = a.priority
        bValue = b.priority
        break
      case 'startDate':
        aValue = new Date(a.startDate).getTime()
        bValue = new Date(b.startDate).getTime()
        break
      case 'endDate':
        aValue = new Date(a.endDate).getTime()
        bValue = new Date(b.endDate).getTime()
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      default:
        return 0
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getTypeLabel = (type: PromotionType) => {
    switch (type) {
      case 'hero_banner': return 'Hero Banner'
      case 'flash_sale': return 'Flash Sale'
      case 'category_offer': return 'Category Offer'
      case 'product_discount': return 'Product Discount'
      case 'countdown_offer': return 'Countdown Offer'
      case 'announcement_strip': return 'Announcement Strip'
      default: return type
    }
  }

  const getTypeColor = (type: PromotionType) => {
    switch (type) {
      case 'hero_banner': return 'bg-purple-100 text-purple-700'
      case 'flash_sale': return 'bg-red-100 text-red-700'
      case 'category_offer': return 'bg-blue-100 text-blue-700'
      case 'product_discount': return 'bg-green-100 text-green-700'
      case 'countdown_offer': return 'bg-orange-100 text-orange-700'
      case 'announcement_strip': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDiscount = (discount?: number) => {
    if (!discount) return 'N/A'
    return `${discount}%`
  }

  if (promotions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No promotions found</h3>
        <p className="text-gray-600 mb-6">
          Get started by creating your first promotion campaign.
        </p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Promotions ({promotions.length})</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preview
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Priority
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('startDate')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Start Date
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('endDate')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  End Date
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedPromotions.map((promotion, index) => {
              const status = PromotionService.getPromotionStatus(promotion)
              
              return (
                <motion.tr
                  key={promotion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Banner Preview */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {promotion.bannerImage ? (
                        <img
                          src={promotion.bannerImage}
                          alt={promotion.title}
                          className="w-16 h-10 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {promotion.title}
                      </div>
                      {promotion.subtitle && (
                        <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                          {promotion.subtitle}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{promotion.priority}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(promotion.type)}`}>
                      {getTypeLabel(promotion.type)}
                    </span>
                  </td>

                  {/* Discount */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatDiscount(promotion.discountPercentage)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">{status}</span>
                      </span>
                      <PromotionStatusToggle
                        promotion={promotion}
                        onToggle={onToggleStatus}
                      />
                    </div>
                  </td>

                  {/* Start Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(promotion.startDate)}
                    </div>
                  </td>

                  {/* End Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(promotion.endDate)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <PromotionActions
                      promotion={promotion}
                      onEdit={() => onEdit(promotion.id)}
                      onDelete={() => onDelete(promotion.id)}
                      onDuplicate={() => onDuplicate(promotion.id)}
                      onToggleStatus={(isActive) => onToggleStatus(promotion.id, isActive)}
                    />
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
