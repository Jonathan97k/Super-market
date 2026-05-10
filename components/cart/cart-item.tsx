'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useCartStore, CartItem } from '@/store/cart-store'

interface CartItemComponentProps {
  item: CartItem
  className?: string
}

export default function CartItemComponent({ item, className = '' }: CartItemComponentProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  
  const { incrementQuantity, decrementQuantity, removeItem } = useCartStore()

  const handleIncrement = () => {
    incrementQuantity(item.id)
  }

  const handleDecrement = () => {
    decrementQuantity(item.id)
  }

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      removeItem(item.id)
    }, 300)
  }

  const imageUrl = item.image || '/images/products/placeholder.jpg'
  const itemTotal = item.price * item.quantity

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        x: isRemoving ? 100 : 0,
        transition: { duration: 0.3 }
      }}
      exit={{ opacity: 0, x: 100 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
    >
      <div className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={imageUrl}
                alt={item.name}
                fill
                className={`object-cover transition-all duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                sizes="80px"
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            {/* Product Name */}
            <Link 
              href={`/products/${item.id}`}
              className="block hover:text-[#16A34A] transition-colors"
            >
              <h3 className="font-semibold text-[#0B1F3A] leading-tight truncate">
                {item.name}
              </h3>
            </Link>

            {/* Category and SKU */}
            <div className="flex items-center gap-2 mt-1">
              {item.category && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {item.category}
                </span>
              )}
              {item.sku && (
                <span className="text-xs text-gray-400">
                  SKU: {item.sku}
                </span>
              )}
            </div>

            {/* Price and Quantity Controls */}
            <div className="flex items-center justify-between mt-3">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Qty:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <motion.button
                    onClick={handleDecrement}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={item.quantity <= 1}
                    className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <Minus className="w-3 h-3" />
                  </motion.button>
                  <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <motion.button
                    onClick={handleIncrement}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1 hover:bg-gray-100 transition-colors"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <Plus className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  MK {item.price.toFixed(2)} each
                </div>
                <div className="font-semibold text-[#16A34A]">
                  MK {itemTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Remove Button */}
          <div className="flex flex-col items-center justify-start">
            <motion.button
              onClick={handleRemove}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label={`Remove ${item.name} from cart`}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
