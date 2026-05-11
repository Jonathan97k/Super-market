'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronDown, Package } from 'lucide-react'

export default function HeroSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isFocused, setIsFocused] = useState(false)

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'fresh-produce', label: 'Fresh Produce' },
    { value: 'dairy-eggs', label: 'Dairy & Eggs' },
    { value: 'meat-seafood', label: 'Meat & Seafood' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'pantry', label: 'Pantry' },
    { value: 'frozen', label: 'Frozen Foods' },
    { value: 'beverages', label: 'Beverages' }
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}${selectedCategory && selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-6 border border-white/20"
    >
      <form onSubmit={handleSearch} className="space-y-3 md:space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
            <Search className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${
              isFocused ? 'text-green-600' : 'text-gray-400'
            }`} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for fresh groceries, brands, and more..."
            className={`w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-gray-50 border rounded-xl transition-all duration-300 text-sm md:text-base ${
              isFocused
                ? 'border-green-500 shadow-lg shadow-green-500/20 bg-white'
                : 'border-gray-200 hover:border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500`}
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none transition-all duration-300 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 cursor-pointer text-sm md:text-base"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Search Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-[#16A34A] to-green-600 text-white py-3 md:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm md:text-base"
        >
          <Search className="w-4 h-4 md:w-5 md:h-5" />
          <span>Search Products</span>
        </motion.button>
      </form>

      {/* Quick Search Suggestions */}
      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
        <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">Popular Searches:</p>
        <div className="flex flex-wrap gap-2">
          {['Fresh Apples', 'Organic Milk', 'Whole Wheat Bread', 'Free Range Eggs'].map((term) => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs md:text-sm hover:bg-gray-200 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Search Stats */}
      <div className="mt-3 md:mt-4 flex items-center justify-center space-x-4 md:space-x-6 text-[10px] md:text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Package className="w-3 h-3" />
          <span>5000+ Products</span>
        </div>
        <div className="flex items-center space-x-1">
          <Search className="w-3 h-3" />
          <span>Instant Search</span>
        </div>
      </div>
    </motion.div>
  )
}
