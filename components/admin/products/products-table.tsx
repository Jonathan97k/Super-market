'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  Package,
  Star,
  Tag,
  Calendar,
  TrendingUp
} from 'lucide-react'
import ProductActions from './product-actions'
import StockToggle from './stock-toggle'

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

interface ProductsTableProps {
  products: Product[]
  selectedProducts: string[]
  onSelectionChange: (selected: string[]) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onDuplicate: (product: Product) => void
}

export default function ProductsTable({
  products,
  selectedProducts,
  onSelectionChange,
  onEdit,
  onDelete,
  onDuplicate
}: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const totalPages = Math.ceil(products.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = products.slice(startIndex, endIndex)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(currentProducts.map(p => p.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedProducts, productId])
    } else {
      onSelectionChange(selectedProducts.filter(id => id !== productId))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isAllSelected = currentProducts.length > 0 && currentProducts.every(p => selectedProducts.includes(p.id))
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < currentProducts.length

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Sticky Header */}
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={isIndeterminate ? (input: any) => {
                    if (input) {
                      input.indeterminate = true
                    }
                  } : undefined}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Flags
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProducts.map((product, index) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>

                {/* Image */}
                <td className="px-4 py-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                </td>

                {/* Name */}
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-xs">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {product.slug}
                    </p>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="px-4 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      MK {product.price.toLocaleString()}
                    </p>
                    {product.oldPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        MK {product.oldPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </td>

                {/* Stock */}
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      product.stock > 10 ? 'text-green-600' :
                      product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {product.stock}
                    </span>
                    <StockToggle
                      productId={product.id}
                      inStock={product.inStock}
                      onToggle={() => {
                        // This would update the product in the parent state
                        console.log('Toggle stock for', product.id)
                      }}
                    />
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.inStock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>

                {/* Flags */}
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-1">
                    {product.featured && (
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center" title="Featured">
                        <Star className="w-3 h-3 text-purple-600" />
                      </div>
                    )}
                    {product.onSale && (
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center" title="On Sale">
                        <Tag className="w-3 h-3 text-orange-600" />
                      </div>
                    )}
                    {product.newArrival && (
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center" title="New Arrival">
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                      </div>
                    )}
                  </div>
                </td>

                {/* Created Date */}
                <td className="px-4 py-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(product.createdAt)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <ProductActions
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                  />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            Get started by adding your first product
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={() => window.location.href = '/admin/products/new'}
          >
            Add Product
          </motion.button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of{' '}
            {products.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm border rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
