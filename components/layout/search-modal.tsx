'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp, Clock, Package } from 'lucide-react'
import { useProducts } from '@/hooks/use-products'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { products } = useProducts()

  const trendingSearches = [
    'Fresh Apples',
    'Organic Milk',
    'Whole Wheat Bread',
    'Free Range Eggs',
    'Greek Yogurt',
  ]

  const recentSearches = [
    'Bananas',
    'Tomatoes',
    'Chicken Breast',
    'Orange Juice',
    'Pasta',
  ]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true)
      // Simulate search API call
      const timer = setTimeout(() => {
        const filtered = products.filter((product: any) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        )
        setSearchResults(filtered.slice(0, 8))
        setIsSearching(false)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }, [query, products])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(query)}`
      onClose()
    }
  }

  const handleProductClick = (productId: string) => {
    window.location.href = `/products/${productId}`
    onClose()
  }

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm)
    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
          {/* Search Header */}
          <div className="p-6 border-b">
            <form onSubmit={handleSearch} className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products, brands, categories..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Search
              </button>
            </form>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-4 h-4 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="mt-4 text-gray-600">Searching products...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Search Results</h3>
                <div className="space-y-3">
                  {searchResults.map((product: any) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                        <p className="text-sm font-semibold text-green-600 mt-1">${product.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : query ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No products found for "{query}"</p>
                <p className="text-sm text-gray-500 mt-2">Try searching with different keywords</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Trending Searches */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Trending Searches</h3>
                    </div>
                    <div className="space-y-2">
                      {trendingSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => handleQuickSearch(search)}
                          className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Recent Searches</h3>
                    </div>
                    <div className="space-y-2">
                      {recentSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => handleQuickSearch(search)}
                          className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Tips */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>💡 Search tips:</span>
                <span>Use specific terms</span>
                <span>Check spelling</span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                Press ESC to close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
