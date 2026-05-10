'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, DollarSign, Star, TrendingUp, Tag } from 'lucide-react'
import { useProductSearch } from '@/hooks/use-product-search'
import { formatPrice } from '@/lib/search'

interface ActiveFiltersProps {
  className?: string
  showClearAll?: boolean
  compact?: boolean
}

export default function ActiveFilters({
  className = '',
  showClearAll = true,
  compact = false
}: ActiveFiltersProps) {
  const {
    filters,
    currentCategory,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    getFilterSummary
  } = useProductSearch()

  if (!hasActiveFilters) {
    return null
  }

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        updateFilter('search', '')
        break
      case 'category':
        updateFilter('categoryId', '')
        updateFilter('category', '')
        break
      case 'price':
        updateFilter('minPrice', 0)
        updateFilter('maxPrice', 100000)
        break
      case 'inStock':
        updateFilter('inStock', false)
        break
      case 'featured':
        updateFilter('featured', false)
        break
      case 'newArrival':
        updateFilter('newArrival', false)
        break
      case 'onSale':
        updateFilter('onSale', false)
        break
    }
  }

  const getFilterTags = () => {
    const tags = []

    // Search filter
    if (filters.search) {
      tags.push({
        type: 'search',
        label: `"${filters.search}"`,
        icon: <Package className="w-3 h-3" />,
        color: 'blue'
      })
    }

    // Category filter
    if (currentCategory) {
      tags.push({
        type: 'category',
        label: currentCategory.name,
        icon: <Package className="w-3 h-3" />,
        color: 'purple'
      })
    }

    // Price range filter
    if (filters.minPrice > 0 || filters.maxPrice < 100000) {
      tags.push({
        type: 'price',
        label: `${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`,
        icon: <DollarSign className="w-3 h-3" />,
        color: 'green'
      })
    }

    // Boolean filters
    if (filters.inStock) {
      tags.push({
        type: 'inStock',
        label: 'In Stock',
        icon: <Package className="w-3 h-3" />,
        color: 'emerald'
      })
    }

    if (filters.featured) {
      tags.push({
        type: 'featured',
        label: 'Featured',
        icon: <Star className="w-3 h-3" />,
        color: 'yellow'
      })
    }

    if (filters.newArrival) {
      tags.push({
        type: 'newArrival',
        label: 'New',
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'blue'
      })
    }

    if (filters.onSale) {
      tags.push({
        type: 'onSale',
        label: 'On Sale',
        icon: <Tag className="w-3 h-3" />,
        color: 'orange'
      })
    }

    return tags
  }

  const filterTags = getFilterTags()

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      green: 'bg-green-100 text-green-700 hover:bg-green-200',
      emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
      yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  if (compact) {
    return (
      <div className={`flex items-center flex-wrap gap-2 ${className}`}>
        <AnimatePresence mode="popLayout">
          {filterTags.map((tag) => (
            <motion.div
              key={tag.type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={`
                flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${getColorClasses(tag.color)}
              `}
            >
              {tag.icon}
              <span className="ml-1">{tag.label}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeFilter(tag.type)}
                className="ml-1 p-0.5 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-2 h-2" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        {showClearAll && filterTags.length > 1 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 font-medium"
          >
            Clear all
          </motion.button>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Active Filters</h3>
        {showClearAll && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </motion.button>
        )}
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {filterTags.map((tag) => (
            <motion.div
              key={tag.type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={`
                flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                ${getColorClasses(tag.color)}
              `}
            >
              {tag.icon}
              <span className="ml-1">{tag.label}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeFilter(tag.type)}
                className="ml-2 p-0.5 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Filter Summary */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          {getFilterSummary()}
        </p>
      </div>
    </div>
  )
}

/**
 * Minimal version for inline display
 */
export function ActiveFiltersMinimal({
  className = ''
}: {
  className?: string
}) {
  const {
    filters,
    currentCategory,
    updateFilter,
    hasActiveFilters
  } = useProductSearch()

  if (!hasActiveFilters) {
    return null
  }

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        updateFilter('search', '')
        break
      case 'category':
        updateFilter('categoryId', '')
        updateFilter('category', '')
        break
      case 'price':
        updateFilter('minPrice', 0)
        updateFilter('maxPrice', 100000)
        break
      case 'inStock':
        updateFilter('inStock', false)
        break
      case 'featured':
        updateFilter('featured', false)
        break
      case 'newArrival':
        updateFilter('newArrival', false)
        break
      case 'onSale':
        updateFilter('onSale', false)
        break
    }
  }

  const getFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (currentCategory) count++
    if (filters.minPrice > 0 || filters.maxPrice < 100000) count++
    if (filters.inStock) count++
    if (filters.featured) count++
    if (filters.newArrival) count++
    if (filters.onSale) count++
    return count
  }

  const filterCount = getFilterCount()

  return (
    <div className={`flex items-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
      >
        <span>{filterCount} filter{filterCount !== 1 ? 's' : ''} active</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            // Clear all filters
            updateFilter('search', '')
            updateFilter('categoryId', '')
            updateFilter('category', '')
            updateFilter('minPrice', 0)
            updateFilter('maxPrice', 100000)
            updateFilter('inStock', false)
            updateFilter('featured', false)
            updateFilter('newArrival', false)
            updateFilter('onSale', false)
          }}
          className="ml-2 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
        >
          <X className="w-3 h-3" />
        </motion.button>
      </motion.div>
    </div>
  )
}
