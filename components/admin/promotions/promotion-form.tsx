'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, X, Upload, Image as ImageIcon, Calendar, Percent, Tag, Link, Palette } from 'lucide-react'
import { PromotionFormData, PromotionType } from '@/services/promotions'
import { Promotion } from '@/types/promotion'
import PromotionBannerPreview from './promotion-banner-preview'
import PromotionScheduler from './promotion-scheduler'
import PromotionStatusSwitch from './promotion-status-toggle'

interface PromotionFormProps {
  promotion?: Promotion
  onSubmit: (data: PromotionFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  categories?: Array<{ id: string; name: string }>
  products?: Array<{ id: string; name: string }>
}

export default function PromotionForm({
  promotion,
  onSubmit,
  onCancel,
  isLoading = false,
  categories = [],
  products = []
}: PromotionFormProps) {
  const [formData, setFormData] = useState<PromotionFormData>({
    title: '',
    subtitle: '',
    bannerImage: '',
    type: 'hero_banner',
    startDate: '',
    endDate: '',
    discountPercentage: 0,
    categoryId: '',
    productId: '',
    buttonText: '',
    buttonUrl: '',
    backgroundTheme: 'navy',
    isActive: true,
    priority: 0
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with promotion data
  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title || '',
        subtitle: promotion.subtitle || '',
        bannerImage: promotion.bannerImage || '',
        type: promotion.type || 'hero_banner',
        startDate: promotion.startDate || '',
        endDate: promotion.endDate || '',
        discountPercentage: promotion.discountPercentage || 0,
        categoryId: promotion.categoryId || '',
        productId: promotion.productId || '',
        buttonText: promotion.buttonText || '',
        buttonUrl: promotion.buttonUrl || '',
        backgroundTheme: promotion.backgroundTheme || 'navy',
        isActive: promotion.isActive ?? true,
        priority: promotion.priority || 0
      })
    }
  }, [promotion])

  const handleInputChange = (field: keyof PromotionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (formData.discountPercentage && (formData.discountPercentage < 0 || formData.discountPercentage > 100)) {
      newErrors.discountPercentage = 'Discount must be between 0 and 100'
    }

    if (formData.buttonText && !formData.buttonUrl) {
      newErrors.buttonUrl = 'Button URL is required when button text is provided'
    }

    if (formData.buttonUrl && !formData.buttonText) {
      newErrors.buttonText = 'Button text is required when button URL is provided'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Failed to save promotion:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const promotionTypes: Array<{ value: PromotionType; label: string; description: string }> = [
    { value: 'hero_banner', label: 'Hero Banner', description: 'Large banner at the top of the homepage' },
    { value: 'flash_sale', label: 'Flash Sale', description: 'Timed sale announcement strip' },
    { value: 'category_offer', label: 'Category Offer', description: 'Discount for specific category' },
    { value: 'product_discount', label: 'Product Discount', description: 'Discount for specific product' },
    { value: 'countdown_offer', description: 'Countdown timer with special offer' },
    { value: 'announcement_strip', label: 'Announcement Strip', description: 'Information bar at the top' }
  ]

  const backgroundThemes = [
    { value: 'navy', label: 'Navy Blue', className: 'bg-blue-900' },
    { value: 'green', label: 'Green', className: 'bg-green-600' },
    { value: 'red', label: 'Red', className: 'bg-red-600' },
    { value: 'purple', label: 'Purple', className: 'bg-purple-600' },
    { value: 'gray', label: 'Gray', className: 'bg-gray-800' },
    { value: 'gradient', label: 'Gradient', className: 'bg-gradient-to-r from-blue-600 to-purple-600' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Fields */}
        <div className="space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter promotion title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subtitle (optional)"
                />
              </div>

              {/* Promotion Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as PromotionType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {promotionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {promotionTypes.find(t => t.value === formData.type)?.description}
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  max="999"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Higher numbers show first (0-999)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PromotionScheduler
              startDate={formData.startDate}
              endDate={formData.endDate}
              onStartDateChange={(date) => handleInputChange('startDate', date)}
              onEndDateChange={(date) => handleInputChange('endDate', date)}
              errors={errors}
            />
          </motion.div>

          {/* Discount & Targeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount & Targeting</h3>
            
            <div className="space-y-4">
              {/* Discount Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) => handleInputChange('discountPercentage', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400">
                    <Percent className="w-5 h-5" />
                  </div>
                </div>
                {errors.discountPercentage && (
                  <p className="mt-1 text-sm text-red-600">{errors.discountPercentage}</p>
                )}
              </div>

              {/* Category Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Target
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Target
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!!formData.categoryId}
                >
                  <option value="">All Products</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {formData.categoryId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Product target is disabled when category is selected
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call to Action</h3>
            
            <div className="space-y-4">
              {/* Button Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => handleInputChange('buttonText', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Shop Now"
                />
                {errors.buttonText && (
                  <p className="mt-1 text-sm text-red-600">{errors.buttonText}</p>
                )}
              </div>

              {/* Button URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button URL
                </label>
                <input
                  type="url"
                  value={formData.buttonUrl}
                  onChange={(e) => handleInputChange('buttonUrl', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="/store/products"
                />
                {errors.buttonUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.buttonUrl}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
            
            <div className="space-y-4">
              {/* Banner Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="url"
                    value={formData.bannerImage}
                    onChange={(e) => handleInputChange('bannerImage', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </button>
                </div>
              </div>

              {/* Background Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {backgroundThemes.map(theme => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => handleInputChange('backgroundTheme', theme.value)}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all
                        ${formData.backgroundTheme === theme.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className={`w-full h-8 rounded ${theme.className} mb-2`} />
                      <span className="text-xs text-gray-700">{theme.label}</span>
                      {formData.backgroundTheme === theme.value && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <PromotionStatusSwitch
              promotion={{
                ...formData,
                id: promotion?.id || '',
                createdAt: promotion?.createdAt || '',
                updatedAt: promotion?.updatedAt || ''
              }}
              onToggle={() => handleInputChange('isActive', !formData.isActive)}
            />
          </motion.div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PromotionBannerPreview promotion={formData} />
          </motion.div>
        </div>
      </div>

      {/* Form Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-6"
      >
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting || isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Promotion
            </>
          )}
        </button>
      </motion.div>
    </form>
  )
}
