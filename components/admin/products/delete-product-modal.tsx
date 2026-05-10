'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, AlertTriangle } from 'lucide-react'

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

interface DeleteProductModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  product: Product | null
}

export default function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  product
}: DeleteProductModalProps) {
  if (!product) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delete Product
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {/* Warning Icon */}
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>

                {/* Warning Message */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Are you sure you want to delete this product?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This action cannot be undone. The product will be permanently removed from your catalog.
                  </p>
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      <p className="text-sm font-medium text-gray-900">
                        MK {product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Warnings */}
                {product.featured && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This product is marked as featured and will be removed from featured listings.
                    </p>
                  </div>
                )}

                {product.stock > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This product has {product.stock} units in stock. Consider updating inventory first.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onConfirm}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete Product
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
