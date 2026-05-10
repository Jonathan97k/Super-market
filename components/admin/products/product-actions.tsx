'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, Copy, MoreVertical, Eye } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  oldPrice?: number
  category: string
  categoryId: string
  stock: number
  image: string
  featured: boolean
  newArrival: boolean
  onSale: boolean
  inStock: boolean
  createdAt: string
  updatedAt: string
}

interface ProductActionsProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onDuplicate: (product: Product) => void
}

export default function ProductActions({
  product,
  onEdit,
  onDelete,
  onDuplicate
}: ProductActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Product actions"
      >
        <MoreVertical className="w-4 h-4" />
      </motion.button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
          >
            {/* View Product */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction(() => {
                // View product in store
                window.open(`/store/products/${product.slug}`, '_blank')
              })}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              View in Store
            </motion.button>

            {/* Edit Product */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction(() => onEdit(product))}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </motion.button>

            {/* Duplicate Product */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction(() => onDuplicate(product))}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </motion.button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-1" />

            {/* Delete Product */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction(() => onDelete(product))}
              className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Product
            </motion.button>
          </motion.div>
        </>
      )}
    </div>
  )
}
