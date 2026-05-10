'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  X
} from 'lucide-react'
import { useDateRange } from '@/hooks/use-analytics'

interface DateRangeFilterProps {
  className?: string
  compact?: boolean
  showRefresh?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
}

export default function DateRangeFilter({ 
  className = '', 
  compact = false,
  showRefresh = true,
  onRefresh,
  isRefreshing = false
}: DateRangeFilterProps) {
  const { 
    dateRange, 
    customRange, 
    presetRanges, 
    updateDateRange, 
    setCustomDateRange 
  } = useDateRange()

  const [isOpen, setIsOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [tempCustomRange, setTempCustomRange] = useState(customRange)

  const handlePresetSelect = (range: typeof presetRanges[0]) => {
    updateDateRange(range)
    setIsOpen(false)
    setShowCustom(false)
  }

  const handleCustomApply = () => {
    if (tempCustomRange.from && tempCustomRange.to) {
      setCustomDateRange(tempCustomRange.from, tempCustomRange.to)
      setIsOpen(false)
      setShowCustom(false)
    }
  }

  const handleQuickDate = (days: number) => {
    const toDate = new Date()
    const fromDate = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000)
    
    const range = {
      from: fromDate.toISOString().slice(0, 10),
      to: toDate.toISOString().slice(0, 10),
      label: `Last ${days} days`
    }
    
    updateDateRange(range)
    setIsOpen(false)
    setShowCustom(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRangeDisplay = () => {
    if (dateRange.label === 'Custom') {
      return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    }
    return dateRange.label
  }

  const getDaysDiff = () => {
    const from = new Date(dateRange.from)
    const to = new Date(dateRange.to)
    const diffTime = Math.abs(to.getTime() - from.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-700">{getRangeDisplay()}</span>
            <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
          </button>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
            >
              <div className="p-2">
                {presetRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handlePresetSelect(range)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      dateRange.from === range.from && dateRange.to === range.to
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {showRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Date Range Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{getRangeDisplay()}</span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
        </button>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Select Date Range</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Options */}
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-3">Quick Select</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickDate(1)}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => handleQuickDate(7)}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => handleQuickDate(30)}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Last 30 days
                </button>
                <button
                  onClick={() => handleQuickDate(90)}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Last 90 days
                </button>
              </div>
            </div>

            {/* Preset Ranges */}
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-3">Preset Ranges</p>
              <div className="space-y-1">
                {presetRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handlePresetSelect(range)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      dateRange.from === range.from && dateRange.to === range.to
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500">Custom Range</p>
                <button
                  onClick={() => setShowCustom(!showCustom)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {showCustom ? 'Hide' : 'Show'}
                </button>
              </div>

              {showCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">From Date</label>
                    <input
                      type="date"
                      value={tempCustomRange.from}
                      onChange={(e) => setTempCustomRange(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">To Date</label>
                    <input
                      type="date"
                      value={tempCustomRange.to}
                      onChange={(e) => setTempCustomRange(prev => ({ ...prev, to: e.target.value }))}
                      min={tempCustomRange.from}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleCustomApply}
                    disabled={!tempCustomRange.from || !tempCustomRange.to}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply Custom Range
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Range Info */}
      <div className="hidden sm:flex items-center text-sm text-gray-500">
        <span>{getDaysDiff()} days</span>
        <span className="mx-2">•</span>
        <span>{formatDate(dateRange.from)}</span>
        <ChevronRight className="w-3 h-3 mx-1" />
        <span>{formatDate(dateRange.to)}</span>
      </div>

      {/* Refresh Button */}
      {showRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      )}
    </div>
  )
}

/**
 * Standalone date range picker for forms
 */
export function DateRangePicker({
  value,
  onChange,
  className = ''
}: {
  value: { from: string; to: string }
  onChange: (range: { from: string; to: string }) => void
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDateChange = (field: 'from' | 'to', date: string) => {
    onChange({ ...value, [field]: date })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
        <span className="text-sm text-gray-700">
          {formatDate(value.from)} - {formatDate(value.to)}
        </span>
        <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Select Date Range</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From Date</label>
                <input
                  type="date"
                  value={value.from}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To Date</label>
                <input
                  type="date"
                  value={value.to}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  min={value.from}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/**
 * Quick date buttons for common ranges
 */
export function QuickDateButtons({
  onDateRangeChange,
  className = ''
}: {
  onDateRangeChange: (range: { from: string; to: string; label: string }) => void
  className?: string
}) {
  const quickRanges = [
    { days: 1, label: 'Today' },
    { days: 7, label: '7 Days' },
    { days: 30, label: '30 Days' },
    { days: 90, label: '90 Days' }
  ]

  const handleQuickRange = (days: number, label: string) => {
    const toDate = new Date()
    const fromDate = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000)
    
    onDateRangeChange({
      from: fromDate.toISOString().slice(0, 10),
      to: toDate.toISOString().slice(0, 10),
      label
    })
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {quickRanges.map((range) => (
        <motion.button
          key={range.label}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleQuickRange(range.days, range.label)}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {range.label}
        </motion.button>
      ))}
    </div>
  )
}
