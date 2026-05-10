'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductSearch } from '@/hooks/use-product-search'
import { Search, Package, TrendingUp, ArrowRight } from 'lucide-react'
import { formatPrice, highlightSearchTerm } from '@/lib/search'

interface LiveSearchDropdownProps {
  searchQuery: string
  popularSearches?: string[]
  onSearchClick: (query: string) => void
  onClose: () => void
}

export default function LiveSearchDropdown({
  searchQuery,
  popularSearches = [],
  onSearchClick,
  onClose
}: LiveSearchDropdownProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const { liveSearchResults, isLiveSearching } = useProductSearch()

  // Get search suggestions when query changes
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      // In a real implementation, you'd call the search suggestions API
      // For now, we'll filter from popular searches
      const filtered = popularSearches.filter(search =>
        search.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [searchQuery, popularSearches])

  // Handle product click
  const handleProductClick = (productSlug: string) => {
    window.location.href = `/store/products/${productSlug}`
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
    >
      <div className="p-4">
        {/* Live Search Results */}
        {liveSearchResults.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Products</h3>
              {isLiveSearching && (
                <div className="text-xs text-gray-500">Searching...</div>
              )}
            </div>
            
            <div className="space-y-2">
              {liveSearchResults.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleProductClick(product.slug)}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 
                        className="text-sm font-medium text-gray-900 truncate"
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchTerm(product.name, searchQuery)
                        }}
                      />
                      <div className="flex items-center ml-2">
                        {/* Stock Badge */}
                        {product.inStock ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            In Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                            Out of Stock
                          </span>
                        )}
                        
                        {/* Featured Badge */}
                        {product.featured && (
                          <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 truncate">
                        {product.category}
                      </p>
                      <div className="flex items-center">
                        {product.oldPrice && (
                          <span className="text-xs text-gray-400 line-through mr-2">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-2" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Suggestions</h3>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => onSearchClick(suggestion)}
                  className="w-full flex items-center p-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-400 mr-3" />
                  <span 
                    className="text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: highlightSearchTerm(suggestion, searchQuery)
                    }}
                  />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Searches */}
        {!searchQuery && popularSearches.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Popular Searches
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {popularSearches.slice(0, 6).map((search, index) => (
                <motion.button
                  key={search}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => onSearchClick(search)}
                  className="p-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {search}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && liveSearchResults.length === 0 && suggestions.length === 0 && !isLiveSearching && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-2">No results found</p>
            <p className="text-xs text-gray-500">
              Try searching for different keywords or browse our categories
            </p>
          </div>
        )}

        {/* View All Results */}
        {searchQuery && liveSearchResults.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSearchClick(searchQuery)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Search className="w-4 h-4 mr-2" />
              View all results for "{searchQuery}"
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
