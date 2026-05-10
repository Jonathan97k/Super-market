'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, AlertCircle, Info } from 'lucide-react'

interface PromotionSchedulerProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export default function PromotionScheduler({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  errors = {},
  disabled = false
}: PromotionSchedulerProps) {
  const [showStartTime, setShowStartTime] = useState(false)
  const [showEndTime, setShowEndTime] = useState(false)

  const formatDateTimeLocal = (dateString: string): string => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleStartDateChange = (value: string) => {
    const date = new Date(value)
    onStartDateChange(date.toISOString())
  }

  const handleEndDateChange = (value: string) => {
    const date = new Date(value)
    onEndDateChange(date.toISOString())
  }

  const getQuickStartOptions = () => {
    const now = new Date()
    const options = [
      { label: 'Now', value: now },
      { label: 'In 1 hour', value: new Date(now.getTime() + 60 * 60 * 1000) },
      { label: 'In 6 hours', value: new Date(now.getTime() + 6 * 60 * 60 * 1000) },
      { label: 'Tomorrow', value: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
      { label: 'Next Week', value: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
    ]
    
    return options
  }

  const getQuickEndOptions = () => {
    const now = new Date()
    const start = startDate ? new Date(startDate) : now
    const options = [
      { label: 'In 1 hour', value: new Date(start.getTime() + 60 * 60 * 1000) },
      { label: 'In 6 hours', value: new Date(start.getTime() + 6 * 60 * 60 * 1000) },
      { label: 'In 12 hours', value: new Date(start.getTime() + 12 * 60 * 60 * 1000) },
      { label: 'Tomorrow', value: new Date(start.getTime() + 24 * 60 * 60 * 1000) },
      { label: 'In 3 days', value: new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000) },
      { label: 'In 1 week', value: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000) },
      { label: 'In 1 month', value: new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000) }
    ]
    
    return options
  }

  const getDuration = (): string => {
    if (!startDate || !endDate) return 'N/A'
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = end.getTime() - start.getTime()
    
    if (diff <= 0) return 'Invalid'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }
  }

  const getStatus = (): { type: 'success' | 'warning' | 'error'; message: string } => {
    if (!startDate || !endDate) {
      return { type: 'warning', message: 'Please set both start and end dates' }
    }

    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return { type: 'error', message: 'End date must be after start date' }
    }

    if (start <= now && end > now) {
      return { type: 'success', message: 'Promotion is currently active' }
    }

    if (start > now) {
      return { type: 'warning', message: 'Promotion is scheduled for the future' }
    }

    if (end <= now) {
      return { type: 'error', message: 'Promotion has expired' }
    }

    return { type: 'success', message: 'Promotion schedule is valid' }
  }

  const status = getStatus()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Schedule
        </h3>
        
        <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
          status.type === 'success' ? 'bg-green-100 text-green-700' :
          status.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {status.type === 'success' && <Info className="w-3 h-3 mr-1" />}
          {status.type === 'warning' && <AlertCircle className="w-3 h-3 mr-1" />}
          {status.type === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
          {status.message}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date & Time <span className="text-red-500">*</span>
          </label>
          
          <input
            type="datetime-local"
            value={formatDateTimeLocal(startDate)}
            onChange={(e) => handleStartDateChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}

          {/* Quick Start Options */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Quick start:</p>
            <div className="flex flex-wrap gap-2">
              {getQuickStartOptions().map((option, index) => (
                <motion.button
                  key={option.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleStartDateChange(option.value.toISOString())}
                  disabled={disabled}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date & Time <span className="text-red-500">*</span>
          </label>
          
          <input
            type="datetime-local"
            value={formatDateTimeLocal(endDate)}
            onChange={(e) => handleEndDateChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
          )}

          {/* Quick End Options */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Quick end:</p>
            <div className="flex flex-wrap gap-2">
              {getQuickEndOptions().slice(0, 4).map((option, index) => (
                <motion.button
                  key={option.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleEndDateChange(option.value.toISOString())}
                  disabled={disabled}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Duration Display */}
      {startDate && endDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Duration: <span className="font-medium ml-1">{getDuration()}</span>
            </div>
            
            <div className="text-xs text-gray-500">
              {new Date(startDate).toLocaleString()} - {new Date(endDate).toLocaleString()}
            </div>
          </div>
        </motion.div>
      )}

      {/* Timezone Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <div className="flex items-start">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Timezone Information</p>
            <p>All times are in your local timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
            <p className="mt-1">Promotions will activate and deactivate based on these times.</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Compact version for inline use
 */
export function PromotionSchedulerCompact({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  errors = {},
  disabled = false
}: PromotionSchedulerProps) {
  const formatDateTimeLocal = (dateString: string): string => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleStartDateChange = (value: string) => {
    const date = new Date(value)
    onStartDateChange(date.toISOString())
  }

  const handleEndDateChange = (value: string) => {
    const date = new Date(value)
    onEndDateChange(date.toISOString())
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formatDateTimeLocal(startDate)}
            onChange={(e) => handleStartDateChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm"
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formatDateTimeLocal(endDate)}
            onChange={(e) => handleEndDateChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm"
          />
          {errors.endDate && (
            <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>
    </div>
  )
}
