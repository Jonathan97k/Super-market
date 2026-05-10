'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { useProductSearch } from '@/hooks/use-product-search'
import { SearchFilters } from '@/lib/search'

interface SortDropdownProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sortOptions: Array<{
  value: SearchFilters['sortBy']
  label: string
  icon?: string
  description: string
}> = [
  {
    value: 'newest',
    label: 'Newest First',
    description: 'Latest products'
  },
  {
    value: 'oldest',
    label: 'Oldest First',
    description: 'Earliest products'
  },
  {
    value: 'price-low-high',
    label: 'Price: Low to High',
    description: 'Budget-friendly first'
  },
  {
    value: 'price-high-low',
    label: 'Price: High to Low',
    description: 'Premium products first'
  },
  {
    value: 'popular',
    label: 'Most Popular',
    description: 'Trending products'
  },
  {
    value: 'featured',
    label: 'Featured First',
    description: 'Editor\'s picks'
  }
]

export default function SortDropdown({
  className = '',
  size = 'md'
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { filters, setSortBy } = useProductSearch()

  const currentSort = sortOptions.find(option => option.value === filters.sortBy)

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

  const handleSortSelect = (value: SearchFilters['sortBy']) => {
    setSortBy(value)
    setIsOpen(false)
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg'
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 bg-white border border-gray-300 rounded-lg
          hover:border-gray-400 transition-colors
          ${sizeClasses[size]}
        `}
      >
        <ArrowUpDown className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700">{currentSort?.label || 'Sort'}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Sort Products</h3>
            </div>

            {/* Options */}
            <div className="py-2">
              {sortOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSortSelect(option.value)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                    ${filters.sortBy === option.value ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className={`
                          text-sm font-medium
                          ${filters.sortBy === option.value ? 'text-blue-600' : 'text-gray-900'}
                        `}>
                          {option.label}
                        </span>
                        {filters.sortBy === option.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center"
                          >
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
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
export function SortDropdownCompact({
  className = ''
}: {
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { filters, setSortBy } = useProductSearch()

  const currentSort = sortOptions.find(option => option.value === filters.sortBy)

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

  const handleSortSelect = (value: SearchFilters['sortBy']) => {
    setSortBy(value)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <ArrowUpDown className="w-3 h-3 text-gray-600" />
        <span className="text-xs text-gray-700">{currentSort?.label || 'Sort'}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3 h-3 text-gray-600" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            <div className="py-1">
              {sortOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSortSelect(option.value)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors
                    ${filters.sortBy === option.value ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={`
                      text-xs font-medium
                      ${filters.sortBy === option.value ? 'text-blue-600' : 'text-gray-900'}
                    `}>
                      {option.label}
                    </span>
                    {filters.sortBy === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center"
                      >
                        <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Button group version
 */
export function SortButtons({
  className = ''
}: {
  className?: string
}) {
  const { filters, setSortBy } = useProductSearch()

  const popularSorts = [
    { value: 'newest' as const, label: 'Newest' },
    { value: 'price-low-high' as const, label: 'Price Low' },
    { value: 'price-high-low' as const, label: 'Price High' },
    { value: 'popular' as const, label: 'Popular' }
  ]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {popularSorts.map((sort) => (
        <motion.button
          key={sort.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortBy(sort.value)}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${filters.sortBy === sort.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          {sort.label}
        </motion.button>
      ))}
    </div>
  )
}
