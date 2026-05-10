'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { Promotion } from '@/types/promotion'
import { PromotionService } from '@/services/promotions'

interface PromotionActionsProps {
  promotion: Promotion
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleStatus: (isActive: boolean) => void
}

export default function PromotionActions({
  promotion,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus
}: PromotionActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${promotion.title}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      await onDuplicate()
    } finally {
      setIsDuplicating(false)
      setIsOpen(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      await onToggleStatus(!promotion.isActive)
    } finally {
      setIsOpen(false)
    }
  }

  const handleViewAnalytics = () => {
    // Navigate to analytics page or open modal
    console.log('View analytics for promotion:', promotion.id)
    setIsOpen(false)
  }

  const handlePreview = () => {
    // Open preview in new tab or modal
    const previewUrl = `/store/preview/promotion/${promotion.id}`
    window.open(previewUrl, '_blank')
    setIsOpen(false)
  }

  const status = PromotionService.getPromotionStatus(promotion)
  const canToggle = status !== 'expired'

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            <div className="py-2">
              {/* Edit */}
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
                onClick={onEdit}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-3 text-gray-400" />
                Edit Promotion
              </motion.button>

              {/* Toggle Status */}
              {canToggle && (
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleToggleStatus}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {promotion.isActive ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-3 text-gray-400" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-3 text-gray-400" />
                      Activate
                    </>
                  )}
                </motion.button>
              )}

              {/* Duplicate */}
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDuplicate}
                disabled={isDuplicating}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDuplicating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-3 text-gray-400 animate-spin" />
                    Duplicating...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-3 text-gray-400" />
                    Duplicate
                  </>
                )}
              </motion.button>

              {/* Preview */}
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePreview}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-3 text-gray-400" />
                Preview
              </motion.button>

              {/* Analytics */}
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewAnalytics}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="w-4 h-4 mr-3 text-gray-400" />
                Analytics
              </motion.button>

              {/* Divider */}
              <div className="my-2 border-t border-gray-100" />

              {/* Delete */}
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#fef2f2' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-3 text-red-400 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-3 text-red-400" />
                    Delete
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Compact version for mobile
 */
export function PromotionActionsCompact({
  promotion,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus
}: PromotionActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${promotion.title}"?`)) return

    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      await onDuplicate()
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <div className="flex items-center space-x-1">
      {/* Edit */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onEdit}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Edit"
      >
        <Edit className="w-3.5 h-3.5" />
      </motion.button>

      {/* Duplicate */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleDuplicate}
        disabled={isDuplicating}
        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
        title="Duplicate"
      >
        {isDuplicating ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </motion.button>

      {/* Delete */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="Delete"
      >
        {isDeleting ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </motion.button>
    </div>
  )
}

/**
 * Button group version for detailed view
 */
export function PromotionActionsButtons({
  promotion,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus
}: PromotionActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${promotion.title}"?`)) return

    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      await onDuplicate()
    } finally {
      setIsDuplicating(false)
    }
  }

  const status = PromotionService.getPromotionStatus(promotion)
  const canToggle = status !== 'expired'

  return (
    <div className="flex flex-wrap gap-2">
      {/* Primary Actions */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onEdit}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </motion.button>

      {/* Toggle Status */}
      {canToggle && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onToggleStatus(!promotion.isActive)}
          className={`
            flex items-center px-4 py-2 rounded-lg font-medium transition-colors
            ${promotion.isActive
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
            }
          `}
        >
          {promotion.isActive ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Activate
            </>
          )}
        </motion.button>
      )}

      {/* Secondary Actions */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDuplicate}
        disabled={isDuplicating}
        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {isDuplicating ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Duplicating...
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </>
        )}
      </motion.button>

      {/* Delete */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        {isDeleting ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </>
        )}
      </motion.button>
    </div>
  )
}
