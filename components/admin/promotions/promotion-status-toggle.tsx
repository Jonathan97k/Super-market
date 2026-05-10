'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Promotion } from '@/types/promotion'
import { PromotionService } from '@/services/promotions'

interface PromotionStatusToggleProps {
  promotion: Promotion
  onToggle: (id: string, isActive: boolean) => void
  disabled?: boolean
}

export default function PromotionStatusToggle({
  promotion,
  onToggle,
  disabled = false
}: PromotionStatusToggleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isActive, setIsActive] = useState(promotion.isActive)

  const handleToggle = async () => {
    if (isLoading || disabled) return

    setIsLoading(true)
    
    try {
      const newStatus = !isActive
      await onToggle(promotion.id, newStatus)
      setIsActive(newStatus)
    } catch (error) {
      console.error('Failed to toggle promotion status:', error)
      // Revert state on error
      setIsActive(promotion.isActive)
    } finally {
      setIsLoading(false)
    }
  }

  const status = PromotionService.getPromotionStatus(promotion)
  const canToggle = status !== 'expired' && !disabled

  return (
    <motion.button
      whileHover={canToggle && !isLoading ? { scale: 1.05 } : {}}
      whileTap={canToggle && !isLoading ? { scale: 0.95 } : {}}
      onClick={handleToggle}
      disabled={!canToggle || isLoading}
      className={`
        relative inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all
        ${isLoading 
          ? 'bg-gray-100 cursor-not-allowed' 
          : canToggle 
            ? isActive 
              ? 'bg-green-100 hover:bg-green-200 text-green-700' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            : 'bg-gray-50 cursor-not-allowed text-gray-400'
        }
      `}
      title={
        isLoading 
          ? 'Updating...' 
          : !canToggle 
            ? status === 'expired' 
              ? 'Cannot activate expired promotion'
              : 'Status locked'
            : isActive 
              ? 'Deactivate promotion'
              : 'Activate promotion'
      }
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-4 h-4" />
        </motion.div>
      ) : isActive ? (
        <Eye className="w-4 h-4" />
      ) : (
        <EyeOff className="w-4 h-4" />
      )}
    </motion.button>
  )
}

/**
 * Compact version for inline display
 */
export function PromotionStatusToggleCompact({
  promotion,
  onToggle,
  disabled = false
}: PromotionStatusToggleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isActive, setIsActive] = useState(promotion.isActive)

  const handleToggle = async () => {
    if (isLoading || disabled) return

    setIsLoading(true)
    
    try {
      const newStatus = !isActive
      await onToggle(promotion.id, newStatus)
      setIsActive(newStatus)
    } catch (error) {
      console.error('Failed to toggle promotion status:', error)
      setIsActive(promotion.isActive)
    } finally {
      setIsLoading(false)
    }
  }

  const status = PromotionService.getPromotionStatus(promotion)
  const canToggle = status !== 'expired' && !disabled

  return (
    <motion.button
      whileHover={canToggle && !isLoading ? { scale: 1.05 } : {}}
      whileTap={canToggle && !isLoading ? { scale: 0.95 } : {}}
      onClick={handleToggle}
      disabled={!canToggle || isLoading}
      className={`
        relative inline-flex items-center justify-center w-6 h-6 rounded transition-all
        ${isLoading 
          ? 'bg-gray-200 cursor-not-allowed' 
          : canToggle 
            ? isActive 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-gray-300 hover:bg-gray-400'
            : 'bg-gray-200 cursor-not-allowed'
        }
      `}
      title={
        isLoading 
          ? 'Updating...' 
          : !canToggle 
            ? status === 'expired' 
              ? 'Cannot activate expired promotion'
              : 'Status locked'
            : isActive 
              ? 'Deactivate promotion'
              : 'Activate promotion'
      }
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-3 h-3 text-white" />
        </motion.div>
      ) : (
        <div className={`
          w-3 h-3 rounded-full transition-all
          ${isActive ? 'bg-white' : 'bg-white'}
        `} />
      )}
    </motion.button>
  )
}

/**
 * Switch version for form controls
 */
export function PromotionStatusSwitch({
  promotion,
  onToggle,
  disabled = false,
  label = "Active"
}: PromotionStatusToggleProps & { label?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isActive, setIsActive] = useState(promotion.isActive)

  const handleToggle = async () => {
    if (isLoading || disabled) return

    setIsLoading(true)
    
    try {
      const newStatus = !isActive
      await onToggle(promotion.id, newStatus)
      setIsActive(newStatus)
    } catch (error) {
      console.error('Failed to toggle promotion status:', error)
      setIsActive(promotion.isActive)
    } finally {
      setIsLoading(false)
    }
  }

  const status = PromotionService.getPromotionStatus(promotion)
  const canToggle = status !== 'expired' && !disabled

  return (
    <div className="flex items-center space-x-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      <motion.button
        whileHover={canToggle && !isLoading ? { scale: 1.02 } : {}}
        whileTap={canToggle && !isLoading ? { scale: 0.98 } : {}}
        onClick={handleToggle}
        disabled={!canToggle || isLoading}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${isLoading 
            ? 'bg-gray-200 cursor-not-allowed' 
            : canToggle 
              ? isActive 
                ? 'bg-green-600' 
                : 'bg-gray-300'
              : 'bg-gray-200 cursor-not-allowed'
          }
        `}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="absolute left-1 w-4 h-4 flex items-center justify-center"
          >
            <Loader2 className="w-3 h-3 text-gray-500" />
          </motion.div>
        ) : (
          <motion.span
            animate={{ x: isActive ? 20 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-colors
              ${isActive ? 'bg-white' : 'bg-white'}
            `}
          />
        )}
      </motion.button>

      {!canToggle && status === 'expired' && (
        <span className="text-xs text-gray-500">Expired</span>
      )}
    </div>
  )
}
