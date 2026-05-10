'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Package,
  Star,
  Tag,
  TrendingUp,
  Trash2,
  Power
} from 'lucide-react'

interface Filters {
  search: string
  category: string
  featured: boolean | null
  onSale: boolean | null
  newArrival: boolean | null
  inStock: boolean | null
  sortBy: 'newest' | 'oldest' | 'highestPrice' | 'lowestPrice' | 'name'
}

interface ProductFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  selectedCount: number
  onBulkDelete: () => void
  onBulkStockUpdate: (inStock: boolean) => void
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  selectedCount,
  onBulkDelete,
  onBulkStockUpdate
}: ProductFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const categories = [
    'All Categories',
    'Dairy',
    'Bakery',
    'Produce',
    'Meat',
    'Pantry',
    'Beverages',
    'Snacks',
    'Frozen'
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highestPrice', label: 'Highest Price' },
    { value: 'lowestPrice', label: 'Lowest Price' },
    { value: 'name', label: 'Name (A-Z)' }
  ]

  const handleFilterToggle = (filterType: keyof Omit<Filters, 'search' | 'category' | 'sortBy'>) => {
    onFiltersChange({
      ...filters,
      [filterType]: filters[filterType] === null ? true : null
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      category: '',
      featured: null,
      onSale: null,
      newArrival: null,
      inStock: null,
      sortBy: 'newest'
    })
  }

  const hasActiveFilters = filters.category || 
    filters.featured !== null || 
    filters.onSale !== null || 
    filters.newArrival !== null || 
    filters.inStock !== null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Main Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category === 'All Categories' ? '' : category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as Filters['sortBy'] })}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Advanced Filters Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
            hasActiveFilters
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
              Active
            </span>
          )}
        </motion.button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex flex-wrap gap-3">
              {/* Featured Filter */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFilterToggle('featured')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  filters.featured
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Star className="w-4 h-4 mr-1" />
                Featured
              </motion.button>

              {/* On Sale Filter */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFilterToggle('onSale')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  filters.onSale
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Tag className="w-4 h-4 mr-1" />
                On Sale
              </motion.button>

              {/* New Arrivals Filter */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFilterToggle('newArrival')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  filters.newArrival
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                New Arrivals
              </motion.button>

              {/* Stock Status Filter */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFilterToggle('inStock')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  filters.inStock === true
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : filters.inStock === false
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Package className="w-4 h-4 mr-1" />
                {filters.inStock === true ? 'In Stock' : filters.inStock === false ? 'Out of Stock' : 'Stock Status'}
              </motion.button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearAllFilters}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Bulk Stock Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onBulkStockUpdate(true)}
                  className="px-3 py-1 text-sm font-medium rounded-md bg-white text-green-600 hover:bg-green-50 transition-colors flex items-center"
                >
                  <Power className="w-3 h-3 mr-1" />
                  In Stock
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onBulkStockUpdate(false)}
                  className="px-3 py-1 text-sm font-medium rounded-md bg-white text-red-600 hover:bg-red-50 transition-colors flex items-center"
                >
                  <Power className="w-3 h-3 mr-1" />
                  Out of Stock
                </motion.button>
              </div>

              {/* Bulk Delete */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBulkDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Selected
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
