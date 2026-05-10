'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  X,
  Image as ImageIcon,
  Package,
  DollarSign,
  Tag,
  Star,
  TrendingUp,
  Power,
  Save,
  ArrowLeft
} from 'lucide-react'
import { useImageUpload } from '@/hooks/use-image-upload'
import ImageDropzone from '@/components/admin/upload/image-dropzone'
import ImagePreviewGrid from '@/components/admin/upload/image-preview-grid'
import UploadProgress from '@/components/admin/upload/upload-progress'
import ImageToolbar from '@/components/admin/upload/image-toolbar'

interface ProductFormData {
  name: string
  slug: string
  description: string
  price: number
  oldPrice?: number
  category: string
  categoryId: string
  stock: number
  image: string | null
  images: string[]
  featured: boolean
  newArrival: boolean
  onSale: boolean
  inStock: boolean
}

interface ProductFormProps {
  product?: ProductFormData
  onSubmit: (data: ProductFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

const categories = [
  { id: 'cat-1', name: 'Dairy' },
  { id: 'cat-2', name: 'Bakery' },
  { id: 'cat-3', name: 'Produce' },
  { id: 'cat-4', name: 'Meat' },
  { id: 'cat-5', name: 'Pantry' },
  { id: 'cat-6', name: 'Beverages' },
  { id: 'cat-7', name: 'Snacks' },
  { id: 'cat-8', name: 'Frozen' }
]

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading = false
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    oldPrice: undefined,
    category: '',
    categoryId: '',
    stock: 0,
    image: null,
    images: [],
    featured: false,
    newArrival: false,
    onSale: false,
    inStock: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Image upload hook
  const imageUpload = useImageUpload({
    productId: formData.slug || 'new-product',
    maxFiles: 5,
    onUploadComplete: (results) => {
      const imageUrls = results.map(r => r.optimized.url)
      setFormData(prev => ({ 
        ...prev, 
        images: imageUrls,
        image: imageUrls[0] || null // Set primary image
      }))
      setErrors(prev => ({ ...prev, image: '' }))
    },
    onError: (error) => {
      setErrors(prev => ({ ...prev, image: error }))
    }
  })

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setFormData(product)
      setImagePreview(product.image)
    }
  }, [product])

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !product) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name, product])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (formData.images.length === 0) {
      newErrors.image = 'At least one product image is required'
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-gray-600 mt-1">
            {product ? 'Update product information' : 'Create a new product for your catalog'}
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Product Information */}
        <div className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="product-slug"
              readOnly={!product}
            />
            <p className="mt-1 text-sm text-gray-500">
              URL-friendly version of the product name
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your product..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.categoryId}
                onChange={(e) => {
                  const category = categories.find(c => c.id === e.target.value)
                  handleInputChange('categoryId', e.target.value)
                  handleInputChange('category', category?.name || '')
                }}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Old Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.oldPrice || ''}
                  onChange={(e) => handleInputChange('oldPrice', parseFloat(e.target.value) || undefined)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                For showing discounts
              </p>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.stock ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
            )}
          </div>
        </div>

        {/* Right Column - Image Upload and Status */}
        <div className="space-y-6">
          {/* Product Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images *
            </label>
            
            {/* Upload Dropzone */}
            <ImageDropzone
              isDragging={imageUpload.isDragging}
              onDragOver={imageUpload.handleDragOver}
              onDragLeave={imageUpload.handleDragLeave}
              onDrop={imageUpload.handleDrop}
              onFileInput={imageUpload.handleFileInput}
              triggerFileInput={imageUpload.triggerFileInput}
              fileInputRef={imageUpload.fileInputRef}
              maxFiles={5}
              currentFiles={imageUpload.uploadedImages.length}
            />

            {/* Upload Progress */}
            {(imageUpload.uploads.length > 0 || imageUpload.uploadedImages.length > 0) && (
              <div className="mt-4">
                <UploadProgress
                  uploads={imageUpload.uploads}
                  onRemove={imageUpload.removeUpload}
                  onRetry={imageUpload.retryUpload}
                />
              </div>
            )}

            {/* Image Toolbar */}
            {(imageUpload.uploads.length > 0 || imageUpload.uploadedImages.length > 0) && (
              <div className="mt-4">
                <ImageToolbar
                  hasPendingUploads={imageUpload.uploads.some(u => u.status === 'idle' || u.status === 'failed')}
                  hasUploadedImages={imageUpload.uploadedImages.length > 0}
                  isUploading={imageUpload.uploads.some(u => u.status === 'uploading' || u.status === 'compressing')}
                  canStartUpload={imageUpload.uploads.some(u => u.status === 'idle')}
                  onStartUpload={imageUpload.startUpload}
                  onPauseUpload={() => {}} // Not implemented in this demo
                  onClearAll={imageUpload.clearAll}
                  onRetryAll={() => imageUpload.uploads.filter(u => u.status === 'failed').forEach(u => imageUpload.retryUpload(u.file))}
                  onDownloadAll={() => {}} // Not implemented in this demo
                  viewMode="grid"
                  onViewModeChange={() => {}} // Not implemented in this demo
                  stats={imageUpload.getStats()}
                />
              </div>
            )}

            {/* Image Preview Grid */}
            {imageUpload.uploadedImages.length > 0 && (
              <div className="mt-4">
                <ImagePreviewGrid
                  images={imageUpload.uploadedImages}
                  onRemove={imageUpload.removeImage}
                  onSetPrimary={imageUpload.setPrimaryImage}
                  onReplace={imageUpload.replaceImage}
                  onRetry={imageUpload.retryUpload}
                />
              </div>
            )}
            
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {/* Status Toggles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Product Status
            </label>
            
            <div className="space-y-3">
              {/* In Stock */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Power className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">In Stock</p>
                    <p className="text-sm text-gray-500">Product is available for purchase</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleInputChange('inStock', !formData.inStock)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.inStock ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    animate={{ x: formData.inStock ? 24 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </motion.button>
              </div>

              {/* Featured */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Featured</p>
                    <p className="text-sm text-gray-500">Show in featured products</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleInputChange('featured', !formData.featured)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.featured ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    animate={{ x: formData.featured ? 24 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </motion.button>
              </div>

              {/* New Arrival */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">New Arrival</p>
                    <p className="text-sm text-gray-500">Mark as new product</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleInputChange('newArrival', !formData.newArrival)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.newArrival ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    animate={{ x: formData.newArrival ? 24 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </motion.button>
              </div>

              {/* On Sale */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Tag className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">On Sale</p>
                    <p className="text-sm text-gray-500">Display sale badge</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleInputChange('onSale', !formData.onSale)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.onSale ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    animate={{ x: formData.onSale ? 24 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </motion.button>
      </div>
    </form>
  )
}
