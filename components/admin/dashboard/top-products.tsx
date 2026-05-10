'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Package, Eye, MoreVertical } from 'lucide-react'

interface TopProduct {
  id: string
  name: string
  image: string
  salesCount: number
  revenue: number
  category: string
  trend: number
  stock: number
}

export default function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Generate mock top products
  const generateTopProducts = (): TopProduct[] => {
    const productNames = [
      'Fresh Milk 1L',
      'Bread Loaf',
      'Eggs (Dozen)',
      'Tomatoes (1kg)',
      'Chicken Breast (1kg)',
      'Rice (5kg)',
      'Cooking Oil (1L)',
      'Sugar (1kg)'
    ]

    const categories = ['Dairy', 'Bakery', 'Produce', 'Meat', 'Pantry', 'Beverages']
    const images = [
      '/images/products/milk.jpg',
      '/images/products/bread.jpg',
      '/images/products/eggs.jpg',
      '/images/products/tomatoes.jpg',
      '/images/products/chicken.jpg',
      '/images/products/rice.jpg',
      '/images/products/oil.jpg',
      '/images/products/sugar.jpg'
    ]

    return productNames.map((name, index) => ({
      id: `product-${index + 1}`,
      name,
      image: images[index],
      salesCount: Math.floor(50 + Math.random() * 200),
      revenue: Math.round((5000 + Math.random() * 15000) * 100) / 100,
      category: categories[index % categories.length],
      trend: Math.round((Math.random() - 0.5) * 40),
      stock: Math.floor(10 + Math.random() * 100)
    })).sort((a, b) => b.salesCount - a.salesCount)
  }

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      
      setProducts(generateTopProducts())
      setIsLoading(false)
    }

    loadProducts()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Top Selling Products</h2>
          <p className="text-sm text-gray-500">Best performing items this month</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          View All Products
        </motion.button>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {/* Product Image */}
            <div className="relative">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              {/* Ranking Badge */}
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {index + 1}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
                <span>Stock: {product.stock}</span>
              </div>
            </div>

            {/* Sales Metrics */}
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {product.salesCount} sold
              </p>
              <div className="flex items-center space-x-1">
                <TrendingUp className={`w-3 h-3 ${
                  product.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={`text-xs font-medium ${
                  product.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.trend > 0 ? '+' : ''}{product.trend}%
                </span>
              </div>
            </div>

            {/* Revenue */}
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                MK {product.revenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">revenue</p>
            </div>

            {/* Actions */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Product actions"
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {products.reduce((sum, p) => sum + p.salesCount, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Sales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              MK {products.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
          >
            Restock Items
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            View Analytics
          </motion.button>
        </div>
      </div>
    </div>
  )
}
