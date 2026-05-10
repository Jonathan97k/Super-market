'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'
import { Product } from '@/types/product'
import { useCartStore } from '@/store/cart-store'

interface ProductCardProps {
  product: Product
  className?: string
  aspectRatio?: '16:9' | '1:1'
}

export default function ProductCard({ 
  product, 
  className = '', 
  aspectRatio = '1:1' 
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const isInStock = product.stock > 0 && product.status === 'active'
  const imageUrl = product.images?.[0] || '/images/products/placeholder.jpg'

  const { addItem, openCart } = useCartStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Add to cart using Zustand store
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      category: product.category,
      sku: product.sku
    })
    
    // Open cart to show item was added
    openCart()
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Navigate to product details
    window.location.href = `/products/${product.id}`
  }

  const aspectRatioClass = aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      className={`bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer ${className}`}
    >
      <Link href={`/products/${product.id}`}>
        <div className="space-y-4">
          {/* Product Image with Fixed Aspect Ratio */}
          <div className={`relative ${aspectRatioClass} bg-gray-100 overflow-hidden`}>
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            
            {/* Loading Placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            
            {/* Stock Status Badge */}
            <div className="absolute top-3 right-3">
              <span 
                className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
                  isInStock 
                    ? 'bg-green-600/90 text-white' 
                    : 'bg-gray-500/90 text-white'
                }`}
                aria-label={`Stock status: ${isInStock ? 'In stock' : 'Out of stock'}`}
              >
                {isInStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Product Details */}
          <div className="p-4 space-y-3">
            {/* Product Title */}
            <h3 
              className="font-bold text-[#0B1F3A] leading-tight line-clamp-2 hover:text-[#16A34A] transition-colors"
              style={{ fontSize: '1.125rem' }}
            >
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span 
                className="font-bold text-[#16A34A]"
                style={{ fontSize: '1.25rem' }}
              >
                MK {product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">per unit</span>
            </div>

            {/* Category Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                {product.category}
              </span>
              {product.tags.length > 0 && (
                <span className="text-xs text-gray-500">
                  +{product.tags.length} tags
                </span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-2 pt-2">
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!isInStock}
                className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-1 ${
                  isInStock
                    ? 'bg-[#16A34A] text-white hover:bg-[#158a3d] hover:shadow-lg hover:shadow-[#16A34A]/25'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label={isInStock ? `Add ${product.name} to cart` : 'Product out of stock'}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isInStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </motion.button>

              <motion.button
                onClick={handleViewDetails}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-3 py-2 rounded-lg font-medium text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                aria-label={`View details for ${product.name}`}
              >
                <Eye className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
