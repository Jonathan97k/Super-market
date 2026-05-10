'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { useProductSearch } from '@/hooks/use-product-search'
import { Category } from '@/lib/search'

interface CategoryTabsProps {
  categories: Category[]
  showAll?: boolean
  className?: string
}

export default function CategoryTabs({
  categories,
  showAll = true,
  className = ''
}: CategoryTabsProps) {
  const { currentCategory, searchByCategory } = useProductSearch()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to active category
  useEffect(() => {
    if (scrollContainerRef.current && currentCategory) {
      const activeTab = scrollContainerRef.current.querySelector(
        `[data-category-id="${currentCategory.id}"]`
      )
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [currentCategory])

  const handleCategoryClick = (category: Category) => {
    searchByCategory(category.id, category.name)
  }

  const handleAllClick = () => {
    searchByCategory('', '')
  }

  return (
    <div className={`relative ${className}`}>
      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center space-x-2 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: 'none'
        }}
      >
        {/* All Categories */}
        {showAll && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAllClick}
            className={`
              flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-all
              ${!currentCategory
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <Package className="w-4 h-4 mr-2" />
            All Products
          </motion.button>
        )}

        {/* Category Tabs */}
        {categories.map((category) => (
          <motion.button
            key={category.id}
            data-category-id={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryClick(category)}
            className={`
              flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-all
              ${currentCategory?.id === category.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {/* Category Icon (if available) */}
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-4 h-4 mr-2 rounded-full object-cover"
              />
            ) : (
              <Package className="w-4 h-4 mr-2" />
            )}
            
            <span className="text-sm font-medium">{category.name}</span>
            
            {/* Product Count Badge */}
            <span className={`
              ml-2 px-2 py-0.5 rounded-full text-xs font-medium
              ${currentCategory?.id === category.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {category.productCount}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Scroll Indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  )
}

/**
 * Compact version for mobile
 */
export function CategoryTabsCompact({
  categories,
  showAll = true,
  className = ''
}: CategoryTabsProps) {
  const { currentCategory, searchByCategory } = useProductSearch()

  const handleCategoryClick = (category: Category) => {
    searchByCategory(category.id, category.name)
  }

  const handleAllClick = () => {
    searchByCategory('', '')
  }

  return (
    <div className={`flex items-center space-x-1 overflow-x-auto ${className}`}>
      {showAll && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAllClick}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
            ${!currentCategory
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
            }
          `}
        >
          All
        </motion.button>
      )}

      {categories.slice(0, 8).map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCategoryClick(category)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
            ${currentCategory?.id === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
            }
          `}
        >
          {category.name}
        </motion.button>
      ))}
    </div>
  )
}

/**
 * Grid version for category pages
 */
export function CategoryGrid({
  categories,
  className = ''
}: {
  categories: Category[]
  className?: string
}) {
  const { searchByCategory } = useProductSearch()

  const handleCategoryClick = (category: Category) => {
    searchByCategory(category.id, category.name)
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {categories.map((category, index) => (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCategoryClick(category)}
          className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-lg transition-all"
        >
          {/* Category Image */}
          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden mb-3">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Category Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
            <p className="text-xs text-gray-500 mb-2">
              {category.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {category.productCount} products
              </span>
              <motion.div
                whileHover={{ x: 3 }}
                className="text-blue-600"
              >
                →
              </motion.div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
