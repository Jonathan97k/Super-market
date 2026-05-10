'use client'

import { motion } from 'framer-motion'
import { Power, Package } from 'lucide-react'

interface StockToggleProps {
  productId: string
  inStock: boolean
  onToggle: () => void
}

export default function StockToggle({ productId, inStock, onToggle }: StockToggleProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className={`relative w-6 h-6 rounded-full transition-colors ${
        inStock
          ? 'bg-green-100 hover:bg-green-200'
          : 'bg-red-100 hover:bg-red-200'
      }`}
      aria-label={`Toggle stock status for product ${productId}`}
    >
      <motion.div
        animate={{ 
          scale: inStock ? 1 : 0.8,
          opacity: inStock ? 1 : 0.7
        }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Package 
          className={`w-3 h-3 ${
            inStock ? 'text-green-600' : 'text-red-600'
          }`} 
        />
      </motion.div>
      
      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {inStock ? 'In Stock' : 'Out of Stock'}
      </div>
    </motion.button>
  )
}
