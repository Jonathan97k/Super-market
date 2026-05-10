'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Star,
  TrendingUp,
  Tag,
  DollarSign
} from 'lucide-react'
import { useProductSearch } from '@/hooks/use-product-search'
import { Category } from '@/lib/search'

interface FilterSidebarProps {
  categories: Category[]
  priceRange: { min: number; max: number }
  className?: string
}

export default function FilterSidebar({
  categories,
  priceRange,
  className = ''
}: FilterSidebarProps) {
  const {
    filters,
    updateFilter,
    toggleFilter,
    clearFilters,
    hasActiveFilters
  } = useProductSearch()

  const [expandedSections, setExpandedSections] = useState<string[]>([
    'categories',
    'price',
    'availability',
    'features'
  ])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0
    if (type === 'min') {
      updateFilter('minPrice', Math.min(numValue, filters.maxPrice))
    } else {
      updateFilter('maxPrice', Math.max(numValue, filters.minPrice))
    }
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </h2>
        
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
      </div>

      <div className="space-y-6">
        {/* Categories */}
        <motion.div
          initial={false}
          animate={{ height: expandedSections.includes('categories') ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Categories
            </h3>
            <button
              onClick={() => toggleSection('categories')}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expandedSections.includes('categories') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {expandedSections.includes('categories') && (
            <div className="space-y-2">
              {categories.map((category) => (
                <motion.label
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="category"
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
          )}
        </motion.div>

        {/* Price Range */}
        <motion.div
          initial={false}
          animate={{ height: expandedSections.includes('price') ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Price Range
            </h3>
            <button
              onClick={() => toggleSection('price')}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expandedSections.includes('price') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {expandedSections.includes('price') && (
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
          )}
        </motion.div>

        {/* Availability */}
        <motion.div
          initial={false}
          animate={{ height: expandedSections.includes('availability') ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Availability</h3>
            <button
              onClick={() => toggleSection('availability')}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expandedSections.includes('availability') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {expandedSections.includes('availability') && (
            <div className="space-y-3">
              <motion.label
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
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
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={false}
          animate={{ height: expandedSections.includes('features') ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Features</h3>
            <button
              onClick={() => toggleSection('features')}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expandedSections.includes('features') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {expandedSections.includes('features') && (
            <div className="space-y-3">
              <motion.label
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
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
                className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
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
                className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
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
          )}
        </motion.div>
      </div>

      {/* Apply Filters Button (Mobile) */}
      <div className="mt-6 pt-6 border-t border-gray-200 lg:hidden">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </motion.button>
      </div>
    </div>
  )
}
