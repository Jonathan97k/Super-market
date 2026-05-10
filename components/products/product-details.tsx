'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ShoppingCart, Plus, Minus, MessageCircle, Star, Check, Truck, Package } from 'lucide-react'
import { Product } from '@/types/product'

interface ProductDetailsProps {
  product: Product
  className?: string
}

export default function ProductDetails({ product, className = '' }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)

  const isInStock = product.stock > 0 && product.status === 'active'
  const maxQuantity = Math.min(product.stock, 10) // Limit to 10 for UX

  const images = product.images?.length > 0 
    ? product.images 
    : ['/images/products/placeholder.jpg']

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (!isInStock) return
    
    // Add to cart logic here
    console.log('Adding to cart:', {
      product: product.name,
      quantity,
      total: product.price * quantity
    })
  }

  const handleWhatsAppOrder = () => {
    const phoneNumber = '+1234567890' // Replace with actual WhatsApp number
    const message = `Hi! I'd like to order:\n\nProduct: ${product.name}\nQuantity: ${quantity}\nPrice: MK ${product.price.toFixed(2)} each\nTotal: MK ${(product.price * quantity).toFixed(2)}\n\nPlease confirm availability and delivery details.`
    
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={images[selectedImage]}
              alt={`${product.name} - Image ${selectedImage + 1}`}
              fill
              className={`object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            
            {/* Stock Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                isInStock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isInStock ? `${product.stock} in stock` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === index
                      ? 'border-green-600 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Product Name & Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-md">
                {product.category}
              </span>
              {product.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-green-600">
              MK {product.price.toFixed(2)}
            </span>
            <span className="text-gray-500">per unit</span>
            {product.stock > 0 && (
              <span className="text-sm text-gray-500">
                (MK {(product.price * quantity).toFixed(2)} total)
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">(4.5 out of 5)</span>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Product Features */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Product Features</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Premium quality ingredients</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Freshly sourced daily</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Carefully packaged for freshness</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Fast delivery available</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= maxQuantity}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                Max: {maxQuantity} units
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!isInStock}
              className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                isInStock
                  ? 'bg-green-600 text-white shadow-lg hover:shadow-xl hover:bg-green-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{isInStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </motion.button>

            <motion.button
              onClick={handleWhatsAppOrder}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-4 bg-green-50 text-green-700 border border-green-200 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 hover:bg-green-100"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Order via WhatsApp</span>
            </motion.button>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="w-4 h-4" />
                <span>SKU: {product.sku}</span>
              </div>
              {product.weight && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="w-4 h-4" />
                  <span>Weight: {product.weight}g</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
