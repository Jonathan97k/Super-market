'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Filter, Package, Star, TrendingUp, Tag, DollarSign } from 'lucide-react'
import { useProductSearch } from '@/hooks/use-product-search'
import { Category } from '@/lib/search'

interface MobileFiltersSheetProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  priceRange: { min: number; max: number }
}

export default function MobileFiltersSheet({
  isOpen,
  onClose,
  categories,
  priceRange
}: MobileFiltersSheetProps) {
  const {
    filters,
    updateFilter,
    toggleFilter,
    clearFilters,
    hasActiveFilters
  } = useProductSearch()

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle price change
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0
    if (type === 'min') {
      updateFilter('minPrice', Math.min(numValue, filters.maxPrice))
    } else {
      updateFilter('maxPrice', Math.max(numValue, filters.minPrice))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h2>
              
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <motion.label
                        key={category.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="category-mobile"
                          checked={filters.categoryId === category.id}
                          onChange={() => {
                            if (filters.categoryId === category.id) {
                              updateFilter('categoryId', '')
                              updateFilter('category', '')
                            } else {
                              updateFilter('categoryId', category.id)
                              updateFilter('category', category.name)
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900">{category.name}</span>
                            <span className="text-xs text-gray-500">
                              ({category.productCount})
                            </span>
                          </div>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Price Range
                  </h3>
                  <div className="space-y-4">
                    {/* Price Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Min</label>
                        <input
                          type="number"
                          value={filters.minPrice}
                          onChange={(e) => handlePriceChange('min', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Max</label>
                        <input
                          type="number"
                          value={filters.maxPrice}
                          onChange={(e) => handlePriceChange('max', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="100000"
                        />
                      </div>
                    </div>

                    {/* Price Range Slider */}
                    <div className="px-2">
                      <div className="relative">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{
                              width: `${((filters.maxPrice - filters.minPrice) / (priceRange.max - priceRange.min)) * 100}%`,
                              marginLeft: `${((filters.minPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>MWK {priceRange.min.toLocaleString()}</span>
                        <span>MWK {priceRange.max.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Availability</h3>
                  <div className="space-y-3">
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={() => toggleFilter('inStock')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-900">In Stock Only</span>
                    </motion.label>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Features</h3>
                  <div className="space-y-3">
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.featured}
                        onChange={() => toggleFilter('featured')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3 flex items-center">
                        <Star className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-sm text-gray-900">Featured Products</span>
                      </div>
                    </motion.label>

                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.newArrival}
                        onChange={() => toggleFilter('newArrival')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3 flex items-center">
                        <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-900">New Arrivals</span>
                      </div>
                    </motion.label>

                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.onSale}
                        onChange={() => toggleFilter('onSale')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3 flex items-center">
                        <Tag className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="text-sm text-gray-900">On Sale</span>
                      </div>
                    </motion.label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
