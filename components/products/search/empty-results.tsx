'use client'

import { motion } from 'framer-motion'
import { Search, Package, RefreshCw, Home, Filter } from 'lucide-react'
import { useProductSearch } from '@/hooks/use-product-search'

interface EmptyResultsProps {
  className?: string
  type?: 'no-results' | 'no-products' | 'error'
  message?: string
  showActions?: boolean
  compact?: boolean
}

export default function EmptyResults({
  className = '',
  type = 'no-results',
  message,
  showActions = true,
  compact = false
}: EmptyResultsProps) {
  const { filters, clearFilters, search, hasActiveFilters, popularSearches } = useProductSearch()

  const handleClearFilters = () => {
    clearFilters()
  }

  const handleBrowseAll = () => {
    search('')
  }

  const handleRetry = () => {
    // Retry search
    search(filters.search)
  }

  const handlePopularSearch = (searchTerm: string) => {
    search(searchTerm)
  }

  if (compact) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {message || 'No products found'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Try adjusting your search or filters
        </p>
        {showActions && (
          <div className="flex justify-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBrowseAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse All
            </motion.button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-8 text-center ${className}`}>
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        {type === 'error' ? (
          <RefreshCw className="w-12 h-12 text-red-500" />
        ) : (
          <Search className="w-12 h-12 text-gray-400" />
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {message || (type === 'error' ? 'Something went wrong' : 'No products found')}
        </h3>

        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {type === 'error' 
            ? 'We encountered an error while searching. Please try again.'
            : hasActiveFilters
            ? 'No products match your current filters. Try adjusting your search criteria or browse all products.'
            : 'We couldn\'t find any products matching your search. Try different keywords or browse our categories.'
          }
        </p>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {type === 'error' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRetry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </motion.button>
            ) : (
              <>
                {hasActiveFilters && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearFilters}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBrowseAll}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Browse All Products
                </motion.button>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Popular Searches */}
      {type === 'no-results' && !hasActiveFilters && popularSearches.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8 pt-8 border-t border-gray-200"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-4">Popular Searches</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearches.slice(0, 6).map((searchTerm, index) => (
              <motion.button
                key={searchTerm}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePopularSearch(searchTerm)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {searchTerm}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Suggestions */}
      {type === 'no-results' && filters.search && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8 pt-8 border-t border-gray-200"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-4">Search Suggestions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Check spelling</p>
              <p className="text-xs text-gray-500">Make sure all words are spelled correctly</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Try different keywords</p>
              <p className="text-xs text-gray-500">Use more general terms</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Fewer filters</p>
              <p className="text-xs text-gray-500">Remove some filters to see more results</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Browse categories</p>
              <p className="text-xs text-gray-500">Explore our product categories</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/**
 * Minimal version for inline display
 */
export function EmptyResultsMinimal({
  className = '',
  message
}: {
  className?: string
  message?: string
}) {
  const { clearFilters, hasActiveFilters } = useProductSearch()

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {message || 'No products found'}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Try adjusting your search criteria
      </p>
      {hasActiveFilters && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Clear Filters
        </motion.button>
      )}
    </div>
  )
}

/**
 * Loading skeleton version
 */
export function EmptyResultsSkeleton({
  className = ''
}: {
  className?: string
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-8 ${className}`}>
      <div className="animate-pulse">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6"></div>
        <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-6"></div>
        <div className="h-10 bg-gray-200 rounded w-32 mx-auto"></div>
      </div>
    </div>
  )
}
