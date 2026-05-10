'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Filter } from 'lucide-react'
import ProductCard from './product-card'
import { ProductService } from '@/services/products'
import { Product } from '@/types/product'

interface ProductGridProps {
  initialCategory?: string
  className?: string
  aspectRatio?: '16:9' | '1:1'
}

const categories = [
  { value: 'all', label: 'All Products' },
  { value: 'fresh-produce', label: 'Fresh Produce' },
  { value: 'dairy-eggs', label: 'Dairy & Eggs' },
  { value: 'meat-seafood', label: 'Meat & Seafood' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'pantry', label: 'Pantry' },
  { value: 'frozen', label: 'Frozen Foods' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'household', label: 'Household' }
]

export default function ProductGrid({ 
  initialCategory = 'all', 
  className = '',
  aspectRatio = '1:1'
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const fetchProducts = async (category: string, pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true)
      
      const filters = {
        category: category === 'all' ? undefined : category,
        status: 'active'
      }
      
      const fetchedProducts = await ProductService.getProducts(filters)
      
      if (append) {
        setProducts(prev => [...prev, ...fetchedProducts])
      } else {
        setProducts(fetchedProducts)
      }
      
      setTotalProducts(fetchedProducts.length)
      setHasMore(fetchedProducts.length >= 12) // Assuming 12 products per page
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(selectedCategory, 1, false)
    setPage(1)
  }, [selectedCategory])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchProducts(selectedCategory, nextPage, true)
  }

  // Animation variants for staggered fade-in effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#0B1F3A] flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#16A34A]" />
            Shop by Category
          </h2>
          <span className="text-sm text-gray-500">
            {totalProducts} products found
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <motion.button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category.value
                  ? 'bg-[#16A34A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={`Filter by ${category.label}`}
            >
              {category.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Products Grid */}
      {loading && products.length === 0 ? (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#0B1F3A] mb-2">No products found</h3>
          <p className="text-gray-600">Try selecting a different category or check back later.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id} 
              variants={itemVariants}
              custom={index}
            >
              <ProductCard 
                product={product} 
                aspectRatio={aspectRatio}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && products.length > 0 && (
        <div className="flex justify-center pt-8">
          <motion.button
            onClick={handleLoadMore}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.3)'
            }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-[#16A34A] text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            aria-label="Load more products"
          >
            <span>Load More Products</span>
          </motion.button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loading && products.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#16A34A]" />
        </div>
      )}
    </div>
  )
}
